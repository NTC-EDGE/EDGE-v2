using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.ApproveSoa;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class ApproveSoaCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly ApproveSoaCommandHandler _handler;

    public ApproveSoaCommandHandlerTests()
    {
        var staffGuid = Guid.NewGuid();
        _currentUserServiceMock.Setup(c => c.UserId).Returns(staffGuid.ToString());

        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StaffUserContext(staffGuid, "Accountant Officer", "Accountant"));

        _repositoryMock
            .Setup(r => r.UserExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new ApproveSoaCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnExistingOp_WhenSoaAlreadyApproved()
    {
        // Arrange
        var soaId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var existingOpId = Guid.NewGuid();

        var soa = new StatementOfAccount
        {
            Id = soaId,
            ApplicationId = appId,
            Status = SoaStatus.Approved
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.PendingPayment,
            StatementsOfAccount = new List<StatementOfAccount> { soa },
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new OrderOfPayment { Id = existingOpId, StatementOfAccountId = soaId, Status = OpStatus.Billed }
            }
        };
        soa.Application = app;

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(soaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);
        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _repositoryMock
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var command = new ApproveSoaCommand(SoaId: soaId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(existingOpId);
        result.Message.Should().Contain("already approved");
        _repositoryMock.Verify(r => r.AddOpAsync(It.IsAny<OrderOfPayment>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldApproveSoaAndGenerateOp_WhenApprovedByAccountant()
    {
        // Arrange
        var soaId = Guid.NewGuid();
        var appId = Guid.NewGuid();

        var soa = new StatementOfAccount
        {
            Id = soaId,
            ApplicationId = appId,
            Status = SoaStatus.Pending,
            TotalAmount = 1500m,
            Histories = new List<SoaHistory>()
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.ForAccountant,
            StatementsOfAccount = new List<StatementOfAccount> { soa },
            OrdersOfPayment = new List<OrderOfPayment>()
        };
        soa.Application = app;

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(soaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);
        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _repositoryMock
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var command = new ApproveSoaCommand(SoaId: soaId, Remarks: "All calculations verified");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        soa.Status.Should().Be(SoaStatus.Approved);
        soa.Histories.Should().HaveCount(1);
        soa.Histories.First().ToStatus.Should().Be(SoaStatus.Approved);

        app.Status.Should().Be(ApplicationStatus.PendingPayment);

        _repositoryMock.Verify(r => r.AddOpAsync(It.Is<OrderOfPayment>(op =>
            op.StatementOfAccountId == soaId &&
            op.ApplicationId == appId &&
            op.AmountDue == 1500m &&
            op.Status == OpStatus.Billed), It.IsAny<CancellationToken>()), Times.Once);

        _repositoryMock.Verify(r => r.UpdateAsync(app, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.AddApplicationStatusHistoryAsync(It.Is<ApplicationStatusHistory>(h => h.Status == ApplicationStatus.PendingPayment), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.AddApplicationHistoryAsync(It.Is<ApplicationHistory>(h => h.ToStatus == ApplicationStatus.PendingPayment && h.StaffRole == "Accountant"), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldResolveByApplicationId_WhenSoaIdIsNull()
    {
        // Arrange
        var soaId = Guid.NewGuid();
        var appId = Guid.NewGuid();

        var soa = new StatementOfAccount
        {
            Id = soaId,
            ApplicationId = appId,
            Status = SoaStatus.Pending,
            TotalAmount = 2500m,
            Histories = new List<SoaHistory>()
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.ForAccountant,
            StatementsOfAccount = new List<StatementOfAccount> { soa },
            OrdersOfPayment = new List<OrderOfPayment>()
        };
        soa.Application = app;

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _repositoryMock
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var command = new ApproveSoaCommand(ApplicationId: appId, Remarks: "Resolved via App ID");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        soa.Status.Should().Be(SoaStatus.Approved);
        app.Status.Should().Be(ApplicationStatus.PendingPayment);
        _repositoryMock.Verify(r => r.AddOpAsync(It.IsAny<OrderOfPayment>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
