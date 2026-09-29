using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.VerifyPayment;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class VerifyPaymentCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly VerifyPaymentCommandHandler _handler;

    public VerifyPaymentCommandHandlerTests()
    {
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(null, "Test Staff", defaultRole));

        _handler = new VerifyPaymentCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenOpNotFound()
    {
        // Arrange
        var command = new VerifyPaymentCommand(Guid.NewGuid(), "OR-123456", 1500m);

        _repositoryMock
            .Setup(r => r.GetOpByIdAsync(command.OpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderOfPayment?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Order of Payment not found.");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenAmountReceivedLessThanAmountDue()
    {
        // Arrange
        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            AmountDue = 2000m,
            Status = OpStatus.Billed
        };

        var command = new VerifyPaymentCommand(op.Id, "OR-123456", 1500m); // 1500 < 2000 due

        _repositoryMock
            .Setup(r => r.GetOpByIdAsync(op.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("is less than the required amount due");
    }

    [Fact]
    public async Task Handle_ShouldSetOpStatusPaid_AndApplicationForIssuance_WhenValidPayment()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.Evaluating
        };

        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Application = app,
            AmountDue = 1500m,
            Status = OpStatus.Billed
        };

        var command = new VerifyPaymentCommand(op.Id, "OR-987654", 1500m);

        _repositoryMock
            .Setup(r => r.GetOpByIdAsync(op.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        op.Status.Should().Be(OpStatus.Paid);
        op.OfficialReceiptNumber.Should().Be("OR-987654");
        op.AmountReceived.Should().Be(1500m);
        op.PaidAt.Should().NotBeNull();

        app.Status.Should().Be(ApplicationStatus.ForIssuance); // Application transitions to ForIssuance

        _repositoryMock.Verify(r => r.AddApplicationHistoryAsync(It.Is<ApplicationHistory>(h => h.ToStatus == ApplicationStatus.ForIssuance), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
