using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.SubmitPayment;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class SubmitPaymentCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ILogger<SubmitPaymentCommandHandler>> _loggerMock = new();
    private readonly SubmitPaymentCommandHandler _handler;

    public SubmitPaymentCommandHandlerTests()
    {
        _currentUserServiceMock.Setup(c => c.UserId).Returns(Guid.NewGuid().ToString());
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(Guid.NewGuid(), "Juan Dela Cruz", defaultRole));

        _handler = new SubmitPaymentCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        // Arrange
        var command = new SubmitPaymentCommand(
            ApplicationId: Guid.NewGuid(),
            PaymentMethod: PaymentMethod.Online,
            ReferenceNumber: "GCASH-12345");

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(command.ApplicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Application not found.");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotPendingPayment()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.Evaluating
        };

        var command = new SubmitPaymentCommand(
            ApplicationId: app.Id,
            PaymentMethod: PaymentMethod.Online,
            ReferenceNumber: "GCASH-12345");

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("PendingPayment");
    }

    [Fact]
    public async Task Handle_ShouldSucceed_AndAdvanceOpToProcessing()
    {
        // Arrange
        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            OpNumber = "OP-2026-0001",
            Status = OpStatus.Billed,
            AmountDue = 1500.00m
        };

        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.PendingPayment,
            OrdersOfPayment = new List<OrderOfPayment> { op }
        };

        var command = new SubmitPaymentCommand(
            ApplicationId: app.Id,
            OrderOfPaymentId: op.Id,
            PaymentMethod: PaymentMethod.Online,
            ReferenceNumber: "LBP-TXN-998877",
            PayorName: "Acme Telecoms Inc.",
            AmountPaid: 1500.00m,
            Remarks: "Paid via Landbank Link.BizPortal");

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        op.Status.Should().Be(OpStatus.Processing);
        op.PaymentMethod.Should().Be(PaymentMethod.Online);
        op.AmountReceived.Should().Be(1500.00m);
        op.Remarks.Should().Contain("LBP-TXN-998877");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
