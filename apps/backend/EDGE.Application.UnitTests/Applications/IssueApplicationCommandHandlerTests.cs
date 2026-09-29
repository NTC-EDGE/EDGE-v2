using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.IssueApplication;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class IssueApplicationCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<IUserAuthorizationService> _userAuthServiceMock = new();
    private readonly Mock<ILogger<IssueApplicationCommandHandler>> _loggerMock = new();
    private readonly IssueApplicationCommandHandler _handler;

    public IssueApplicationCommandHandlerTests()
    {
        _userAuthServiceMock
            .Setup(a => a.HasAnyPermissionAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(Guid.NewGuid(), "Engr. Jane Evaluator", defaultRole));

        _handler = new IssueApplicationCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object,
            _userAuthServiceMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        // Arrange
        var command = new IssueApplicationCommand
        {
            ApplicationId = Guid.NewGuid(),
            FormNumber = "NTC-R07-2026-FORM-1001",
            IssueDate = DateTime.UtcNow
        };

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
    public async Task Handle_ShouldReturnFail_WhenApplicationNotInForIssuanceStatus()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.Evaluating
        };

        var command = new IssueApplicationCommand
        {
            ApplicationId = app.Id,
            FormNumber = "NTC-R07-2026-FORM-1001",
            IssueDate = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Cannot issue document. Application is not in 'ForIssuance' status");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenPaymentNotVerified()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.ForIssuance,
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new OrderOfPayment
                {
                    Status = OpStatus.Billed, // Not Paid
                    AmountDue = 500m
                }
            }
        };

        var command = new IssueApplicationCommand
        {
            ApplicationId = app.Id,
            FormNumber = "NTC-R07-2026-FORM-1001",
            IssueDate = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Payment has not been verified");
    }

    [Fact]
    public async Task Handle_ShouldSuccessfullyIssueDocument_WhenPrimaryEvaluatorIssues()
    {
        // Arrange
        var evaluatorUserId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.ForIssuance,
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new OrderOfPayment
                {
                    Status = OpStatus.Paid,
                    OfficialReceiptNumber = "OR-12345"
                }
            },
            Histories = new List<ApplicationHistory>
            {
                new ApplicationHistory
                {
                    Action = "Technical Evaluation Approved",
                    PerformedByUserId = evaluatorUserId,
                    StaffName = "Engr. Jane Evaluator",
                    Timestamp = DateTime.UtcNow.AddDays(-1)
                }
            }
        };

        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StaffUserContext(evaluatorUserId, "Engr. Jane Evaluator", "Evaluator"));

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var command = new IssueApplicationCommand
        {
            ApplicationId = app.Id,
            DocumentType = "Radio Station License",
            FormNumber = "NTC-R07-2026-FORM-1001",
            LicenseNumber = "NTC-R07-2026-LIC-1001",
            CallSign = "DWXX",
            StationClass = "FX",
            FrequencyBand = "144-146 MHz",
            IssueDate = DateTime.UtcNow,
            ExpiryDate = DateTime.UtcNow.AddYears(3),
            Remarks = "Approved and issued."
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FormNumber.Should().Be("NTC-R07-2026-FORM-1001");
        result.Data.LicenseNumber.Should().Be("NTC-R07-2026-LIC-1001");
        result.Data.IsAlternateIssuer.Should().BeFalse();
        result.Data.OfficialReceiptNumber.Should().Be("OR-12345");

        app.Status.Should().Be(ApplicationStatus.Completed);
        _repositoryMock.Verify(r => r.AddIssuedDocumentDetailAsync(It.Is<IssuedDocumentDetail>(d =>
            d.FormNumber == "NTC-R07-2026-FORM-1001" &&
            d.LicenseNumber == "NTC-R07-2026-LIC-1001" &&
            d.IsAlternateIssuer == false), It.IsAny<CancellationToken>()), Times.Once);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldSuccessfullyIssueDocument_WhenAlternateEvaluatorIssuesOnBehalfOfPrimary()
    {
        // Arrange
        var originalEvaluatorUserId = Guid.NewGuid();
        var alternateEvaluatorUserId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.ForIssuance,
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new OrderOfPayment
                {
                    Status = OpStatus.Paid,
                    OfficialReceiptNumber = "OR-998877"
                }
            },
            Histories = new List<ApplicationHistory>
            {
                new ApplicationHistory
                {
                    Action = "Technical Evaluation Approved",
                    PerformedByUserId = originalEvaluatorUserId,
                    StaffName = "Engr. Primary Evaluator",
                    Timestamp = DateTime.UtcNow.AddDays(-2)
                }
            }
        };

        // Alternate evaluator is calling the API
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StaffUserContext(alternateEvaluatorUserId, "Engr. Alternate Standin", "Evaluator"));

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var command = new IssueApplicationCommand
        {
            ApplicationId = app.Id,
            DocumentType = "Permit to Purchase",
            FormNumber = "NTC-R07-2026-FORM-8888",
            IssueDate = DateTime.UtcNow,
            Remarks = "Issued by standby evaluator due to urgent release."
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.IsAlternateIssuer.Should().BeTrue();
        result.Data.OriginalEvaluatorName.Should().Be("Engr. Primary Evaluator");
        result.Data.IssuedByStaffName.Should().Be("Engr. Alternate Standin");

        app.Status.Should().Be(ApplicationStatus.Completed);
        _repositoryMock.Verify(r => r.AddIssuedDocumentDetailAsync(It.Is<IssuedDocumentDetail>(d =>
            d.FormNumber == "NTC-R07-2026-FORM-8888" &&
            d.IsAlternateIssuer == true &&
            d.OriginalEvaluatorName == "Engr. Primary Evaluator"), It.IsAny<CancellationToken>()), Times.Once);

        _repositoryMock.Verify(r => r.AddApplicationHistoryAsync(It.Is<ApplicationHistory>(h =>
            h.ToStatus == ApplicationStatus.Completed &&
            h.Action.Contains("Alternate Issuing Officer")), It.IsAny<CancellationToken>()), Times.Once);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
