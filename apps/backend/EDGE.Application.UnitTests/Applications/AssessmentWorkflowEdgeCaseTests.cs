using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.ConvertAssessmentToRealApplication;
using EDGE.Application.Applications.Commands.ReprocessAssessment;
using EDGE.Application.Applications.Commands.UpdateApplicationStatus;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class AssessmentWorkflowEdgeCaseTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<INumberingSeriesService> _numberingSeriesServiceMock = new();
    private readonly Mock<ILogger<ReprocessAssessmentCommandHandler>> _reprocessLoggerMock = new();
    private readonly Mock<ILogger<ConvertAssessmentToRealApplicationCommandHandler>> _convertLoggerMock = new();
    private readonly Mock<ILogger<UpdateApplicationStatusCommandHandler>> _updateStatusLoggerMock = new();

    public AssessmentWorkflowEdgeCaseTests()
    {
        var officerGuid = Guid.NewGuid();
        _currentUserServiceMock.Setup(c => c.UserId).Returns(officerGuid.ToString());
        _currentUserServiceMock.Setup(c => c.Email).Returns("officer@ntc.gov.ph");

        _repositoryMock
            .Setup(r => r.UserExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
    }

    [Fact]
    public async Task UpdateStatus_WhenAssessmentOnly_CompletesDirectlyAndApprovesLatestSoa()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var soaId = Guid.NewGuid();
        var soa = new StatementOfAccount
        {
            Id = soaId,
            ApplicationId = appId,
            Status = SoaStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.AssessmentOnly,
            Status = ApplicationStatus.Evaluating,
            StatementsOfAccount = new List<StatementOfAccount> { soa }
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        _repositoryMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new UpdateApplicationStatusCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _updateStatusLoggerMock.Object,
            _numberingSeriesServiceMock.Object);

        var command = new UpdateApplicationStatusCommand
        {
            Id = appId,
            Status = nameof(ApplicationStatus.ForAccountant) // Evaluator forwarding
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        app.Status.Should().Be(ApplicationStatus.Completed);
        app.AssessedAt.Should().NotBeNull();
        soa.Status.Should().Be(SoaStatus.Approved);

        _repositoryMock.Verify(r => r.AddSoaHistoryAsync(
            It.Is<SoaHistory>(h => h.StatementOfAccountId == soaId && h.ToStatus == SoaStatus.Approved),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatus_WhenAssessmentOnly_AndApplicationHasDanglingOpFromPriorTransition_WithdrawsOpToReturned()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            Status = SoaStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
        var danglingOp = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            StatementOfAccountId = soa.Id,
            Status = OpStatus.Billed,
            AmountDue = 1500m
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.AssessmentOnly,
            Status = ApplicationStatus.Evaluating,
            StatementsOfAccount = new List<StatementOfAccount> { soa },
            OrdersOfPayment = new List<OrderOfPayment> { danglingOp }
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        _repositoryMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new UpdateApplicationStatusCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _updateStatusLoggerMock.Object,
            _numberingSeriesServiceMock.Object);

        // Act: Evaluator completes assessment
        var command = new UpdateApplicationStatusCommand
        {
            Id = appId,
            Status = nameof(ApplicationStatus.Completed)
        };

        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        danglingOp.Status.Should().Be(OpStatus.Returned);
        danglingOp.Remarks.Should().Contain("Withdrawn");

        _repositoryMock.Verify(r => r.AddOpHistoryAsync(
            It.Is<OpHistory>(h => h.OrderOfPaymentId == danglingOp.Id && h.ToStatus == OpStatus.Returned),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatus_WhenRegularApplicationTransitionsBackFromAccountant_ReSubmitsOpToBilledWithAuditRecord()
    {
        // Arrange: Application returned by Accountant, existing OP is in Returned status
        var appId = Guid.NewGuid();
        var soa = new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            Status = SoaStatus.Returned,
            TotalAmount = 2500m,
            CreatedAt = DateTime.UtcNow
        };
        var returnedOp = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            StatementOfAccountId = soa.Id,
            Status = OpStatus.Returned,
            AmountDue = 2000m
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.Regular,
            Status = ApplicationStatus.Returned,
            StatementsOfAccount = new List<StatementOfAccount> { soa },
            OrdersOfPayment = new List<OrderOfPayment> { returnedOp }
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        _repositoryMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new UpdateApplicationStatusCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _updateStatusLoggerMock.Object,
            _numberingSeriesServiceMock.Object);

        // Act: Evaluator re-approves and forwards to Accountant
        var command = new UpdateApplicationStatusCommand
        {
            Id = appId,
            Status = nameof(ApplicationStatus.ForAccountant),
            Remarks = "Corrected fee breakdown endorsed to Accountant."
        };

        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        app.Status.Should().Be(ApplicationStatus.ForAccountant);
        returnedOp.Status.Should().Be(OpStatus.Billed);
        returnedOp.AmountDue.Should().Be(2500m);

        _repositoryMock.Verify(r => r.AddOpHistoryAsync(
            It.Is<OpHistory>(h => h.OrderOfPaymentId == returnedOp.Id && h.FromStatus == OpStatus.Returned && h.ToStatus == OpStatus.Billed),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReprocessAssessment_WhenAssessmentOnly_IncrementsCycleAndSetsEvaluating()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.AssessmentOnly,
            Status = ApplicationStatus.Completed,
            AssessmentVersion = 1
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new ReprocessAssessmentCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _reprocessLoggerMock.Object);

        var command = new ReprocessAssessmentCommand
        {
            ApplicationId = appId,
            Remarks = "Please adjust antenna count to 2."
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        app.AssessmentVersion.Should().Be(2);
        app.AssessmentRemarks.Should().Be("Please adjust antenna count to 2.");
        app.Status.Should().Be(ApplicationStatus.Evaluating);

        _repositoryMock.Verify(r => r.AddApplicationHistoryAsync(
            It.Is<ApplicationHistory>(h => h.ApplicationId == appId && h.ToStatus == ApplicationStatus.Evaluating && h.Action == "Re-assessment Requested"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReprocessAssessment_WhenAlreadyEvaluating_ReturnsFailurePreventingDuplicateResubmission()
    {
        // Arrange: Application already under active evaluation
        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.AssessmentOnly,
            Status = ApplicationStatus.Evaluating,
            AssessmentVersion = 2
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new ReprocessAssessmentCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _reprocessLoggerMock.Object);

        var command = new ReprocessAssessmentCommand
        {
            ApplicationId = appId,
            Remarks = "Duplicate submission attempt"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("already under active evaluation");
        app.AssessmentVersion.Should().Be(2); // Not incremented
    }

    [Fact]
    public async Task ReprocessAssessment_WhenRegularApplication_ReturnsFailure()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.Regular,
            Status = ApplicationStatus.Approved
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new ReprocessAssessmentCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _reprocessLoggerMock.Object);

        var command = new ReprocessAssessmentCommand
        {
            ApplicationId = appId,
            Remarks = "Not an assessment"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Only pre-assessment applications");
    }

    [Fact]
    public async Task ConvertAssessmentToRealApplication_WhenApprovedSoaExists_TransitionsToForAccountantForOpReview()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.AssessmentOnly,
            Status = ApplicationStatus.Completed,
            StatementsOfAccount = new List<StatementOfAccount>
            {
                new() { Id = Guid.NewGuid(), ApplicationId = appId, Status = SoaStatus.Approved }
            }
        };

        _repositoryMock.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new ConvertAssessmentToRealApplicationCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _convertLoggerMock.Object);

        var command = new ConvertAssessmentToRealApplicationCommand
        {
            ApplicationId = appId,
            Remarks = "Converting to official application."
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        app.Intent.Should().Be(ApplicationIntent.Regular);
        app.ApplicationNumber.Should().StartWith("APP-");
        app.Status.Should().Be(ApplicationStatus.ForAccountant);
    }
}
