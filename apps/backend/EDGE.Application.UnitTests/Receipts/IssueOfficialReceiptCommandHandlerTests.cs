using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Receipts.Commands.Receipts.IssueOfficialReceipt;
using EDGE.Application.Receipts.Dtos;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Receipts;

public class IssueOfficialReceiptCommandHandlerTests
{
    private readonly Mock<IOfficialReceiptRepository> _receiptRepoMock = new();
    private readonly Mock<IOrBookletRepository> _bookletRepoMock = new();
    private readonly Mock<IApplicationFullRepository> _appRepoMock = new();
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ILogger<IssueOfficialReceiptCommandHandler>> _loggerMock = new();
    private readonly IssueOfficialReceiptCommandHandler _handler;

    public IssueOfficialReceiptCommandHandlerTests()
    {
        _currentUserServiceMock.Setup(s => s.UserId).Returns(Guid.NewGuid().ToString());
        _userRepoMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StaffUserContext(Guid.NewGuid(), "Jane Cashier", "Cashier"));

        _handler = new IssueOfficialReceiptCommandHandler(
            _receiptRepoMock.Object,
            _bookletRepoMock.Object,
            _appRepoMock.Object,
            _userRepoMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldIssueReceiptAndAdvanceApplication_WhenValid()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var bookletId = Guid.NewGuid();
        var opId = Guid.NewGuid();
        var appId = Guid.NewGuid();

        var booklet = new OrBooklet
        {
            Id = bookletId,
            TenantId = tenantId,
            BookletNumber = "BKL-001",
            Prefix = "OR-2026-",
            StartNumber = 1,
            EndNumber = 50,
            CurrentNumber = 1,
            TotalCount = 50,
            IssuedCount = 0,
            Status = BookletStatus.Active
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            ApplicationNumber = "APP-2026-001",
            Status = ApplicationStatus.PendingPayment
        };

        var op = new OrderOfPayment
        {
            Id = opId,
            ApplicationId = appId,
            Application = app,
            OpNumber = "OP-2026-001",
            AmountDue = 510m,
            Status = OpStatus.Processing
        };

        _bookletRepoMock
            .Setup(b => b.GetByIdAsync(bookletId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booklet);

        _receiptRepoMock
            .Setup(r => r.ExistsOrNumberAsync(tenantId, It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _appRepoMock
            .Setup(a => a.GetOpByIdAsync(opId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        _appRepoMock
            .Setup(a => a.UserExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var command = new IssueOfficialReceiptCommand(
            TenantId: tenantId,
            OrderOfPaymentId: opId,
            BookletId: bookletId,
            PayorName: "Angel Pallado",
            Amount: 510m,
            PaymentMethod: PaymentMethod.Cash,
            LineItems: new List<CreateReceiptLineItemInput>
            {
                new("REG", "Registration", 300m),
                new("AF", "Application Fee", 180m),
                new("DST", "Documentary Stamp Tax", 30m)
            }
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.OfficialReceiptNumber.Should().Be("OR-2026-0000001");
        result.Data.Amount.Should().Be(510m);

        op.Status.Should().Be(OpStatus.Paid);
        op.OfficialReceiptNumber.Should().Be("OR-2026-0000001");
        app.Status.Should().Be(ApplicationStatus.ForIssuance);

        _appRepoMock.Verify(a => a.AddOpHistoryAsync(It.Is<OpHistory>(h => h.ToStatus == OpStatus.Paid), It.IsAny<CancellationToken>()), Times.Once);
        _appRepoMock.Verify(a => a.AddApplicationHistoryAsync(It.Is<ApplicationHistory>(h => h.ToStatus == ApplicationStatus.ForIssuance), It.IsAny<CancellationToken>()), Times.Once);
        _appRepoMock.Verify(a => a.AddApplicationStatusHistoryAsync(It.Is<ApplicationStatusHistory>(h => h.Status == ApplicationStatus.ForIssuance), It.IsAny<CancellationToken>()), Times.Once);
        _receiptRepoMock.Verify(r => r.AddAsync(It.IsAny<OfficialReceipt>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenAmountLessThanDue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var bookletId = Guid.NewGuid();
        var opId = Guid.NewGuid();

        var booklet = new OrBooklet
        {
            Id = bookletId,
            TenantId = tenantId,
            BookletNumber = "BKL-001",
            Prefix = "OR-2026-",
            StartNumber = 1,
            EndNumber = 50,
            CurrentNumber = 1,
            TotalCount = 50,
            IssuedCount = 0,
            Status = BookletStatus.Active
        };

        var op = new OrderOfPayment
        {
            Id = opId,
            ApplicationId = Guid.NewGuid(),
            OpNumber = "OP-2026-001",
            AmountDue = 510m,
            Status = OpStatus.Processing,
            Application = new Domain.Entities.Application { Status = ApplicationStatus.PendingPayment }
        };

        _bookletRepoMock
            .Setup(b => b.GetByIdAsync(bookletId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booklet);

        _receiptRepoMock
            .Setup(r => r.ExistsOrNumberAsync(tenantId, It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _appRepoMock
            .Setup(a => a.GetOpByIdAsync(opId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        var command = new IssueOfficialReceiptCommand(
            TenantId: tenantId,
            OrderOfPaymentId: opId,
            BookletId: bookletId,
            PayorName: "Angel Pallado",
            Amount: 300m, // Less than 510
            PaymentMethod: PaymentMethod.Cash
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("less than the required amount due");
    }

    [Fact]
    public async Task Handle_ShouldFail_WhenAppNotInPendingPayment()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var bookletId = Guid.NewGuid();
        var opId = Guid.NewGuid();

        var booklet = new OrBooklet
        {
            Id = bookletId,
            TenantId = tenantId,
            BookletNumber = "BKL-001",
            Prefix = "OR-2026-",
            StartNumber = 1,
            EndNumber = 50,
            CurrentNumber = 1,
            TotalCount = 50,
            IssuedCount = 0,
            Status = BookletStatus.Active
        };

        var op = new OrderOfPayment
        {
            Id = opId,
            ApplicationId = Guid.NewGuid(),
            OpNumber = "OP-2026-001",
            AmountDue = 510m,
            Status = OpStatus.Billed,
            Application = new Domain.Entities.Application { Status = ApplicationStatus.ForAccountant }
        };

        _bookletRepoMock
            .Setup(b => b.GetByIdAsync(bookletId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booklet);

        _receiptRepoMock
            .Setup(r => r.ExistsOrNumberAsync(tenantId, It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _appRepoMock
            .Setup(a => a.GetOpByIdAsync(opId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        var command = new IssueOfficialReceiptCommand(
            TenantId: tenantId,
            OrderOfPaymentId: opId,
            BookletId: bookletId,
            PayorName: "Angel Pallado",
            Amount: 510m,
            PaymentMethod: PaymentMethod.Cash
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Payment can only be accepted when the application is in 'PendingPayment' status");
    }

    [Fact]
    public async Task Handle_ShouldSupportSplitOrIssuance_WhenAllowPartialPaymentIsTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var bookletId = Guid.NewGuid();
        var opId = Guid.NewGuid();

        var booklet = new OrBooklet
        {
            Id = bookletId,
            TenantId = tenantId,
            BookletNumber = "B01",
            CurrentNumber = 1,
            EndNumber = 50,
            TotalCount = 50,
            IssuedCount = 0,
            Status = BookletStatus.Active
        };

        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-2026-001",
            Status = ApplicationStatus.PendingPayment
        };

        var op = new OrderOfPayment
        {
            Id = opId,
            ApplicationId = app.Id,
            OpNumber = "OP-2026-001",
            AmountDue = 5000m,
            AmountReceived = 0m,
            Status = OpStatus.Billed,
            Application = app
        };

        _bookletRepoMock
            .Setup(b => b.GetByIdAsync(bookletId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booklet);

        _receiptRepoMock
            .Setup(r => r.ExistsOrNumberAsync(tenantId, It.IsAny<string>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _receiptRepoMock
            .Setup(r => r.GetByOrderOfPaymentIdAsync(opId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OfficialReceipt>());

        _appRepoMock
            .Setup(a => a.GetOpByIdAsync(opId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(op);

        var command = new IssueOfficialReceiptCommand(
            TenantId: tenantId,
            OrderOfPaymentId: opId,
            BookletId: bookletId,
            PayorName: "Globe Telecom",
            Amount: 3000m, // Partial check portion of 5000 total
            PaymentMethod: PaymentMethod.Check,
            CheckNumber: "CHK-998811",
            CheckBank: "LandBank",
            AllowPartialPayment: true
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Amount.Should().Be(3000m);
        result.Data.PaymentMethod.Should().Be(PaymentMethod.Check);

        // Order of Payment should be in Processing status (not yet Paid)
        op.Status.Should().Be(OpStatus.Processing);
        op.AmountReceived.Should().Be(3000m);
        // Application remains in PendingPayment for remainder
        app.Status.Should().Be(ApplicationStatus.PendingPayment);
    }
}
