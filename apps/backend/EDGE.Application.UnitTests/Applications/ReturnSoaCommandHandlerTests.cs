using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.ReturnSoa;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class ReturnSoaCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly ReturnSoaCommandHandler _handler;

    public ReturnSoaCommandHandlerTests()
    {
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(null, "Accountant User", defaultRole));

        _handler = new ReturnSoaCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenSoaNotFound()
    {
        // Arrange
        var command = new ReturnSoaCommand(Guid.NewGuid(), "Fee discrepancy");

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(command.SoaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((StatementOfAccount?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("SOA not found.");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenSoaNotPending()
    {
        // Arrange
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            Status = SoaStatus.Approved,
        };

        var command = new ReturnSoaCommand(soa.Id, "Fee discrepancy");

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(command.SoaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("SOA must be Pending to return.");
    }

    [Fact]
    public async Task Handle_ShouldSetSoaAndApplicationToReturned_WhenReturnedByAccountant()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            Status = SoaStatus.Pending,
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.ForAccountant,
        };

        var command = new ReturnSoaCommand(soa.Id, "Fee computation needs adjustment");

        _repositoryMock
            .Setup(r => r.GetSoaByIdAsync(command.SoaId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(soa);

        _repositoryMock
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        soa.Status.Should().Be(SoaStatus.Returned);
        soa.Remarks.Should().Be("Fee computation needs adjustment");
        soa.Histories.Should().HaveCount(1);
        soa.Histories.First().ToStatus.Should().Be(SoaStatus.Returned);

        app.Status.Should().Be(ApplicationStatus.Returned);
        app.Remarks.Should().Contain("Fee computation needs adjustment");

        _repositoryMock.Verify(r => r.UpdateAsync(app, It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.AddApplicationStatusHistoryAsync(It.Is<ApplicationStatusHistory>(h => h.Status == ApplicationStatus.Returned), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.AddApplicationHistoryAsync(It.Is<ApplicationHistory>(h => h.ToStatus == ApplicationStatus.Returned && h.StaffRole == "Accountant"), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
