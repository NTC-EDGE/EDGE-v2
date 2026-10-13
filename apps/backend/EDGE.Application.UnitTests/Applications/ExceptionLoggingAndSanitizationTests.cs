using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.ConvertAssessmentToRealApplication;
using EDGE.Application.Applications.Commands.DeleteDraftApplication;
using EDGE.Application.Applications.Commands.ReprocessAssessment;
using EDGE.Application.Applications.Commands.UpdateApplication;
using EDGE.Application.Applications.Commands.UpdateApplicationStatus;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class ExceptionLoggingAndSanitizationTests
{
    [Fact]
    public async Task ConvertAssessment_WhenExceptionThrown_LogsStackTraceAndReturnsSanitizedResponse()
    {
        // Arrange
        var mockAppRepo = new Mock<IApplicationFullRepository>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        var mockCurrentUserService = new Mock<ICurrentUserService>();
        var mockLogger = new Mock<ILogger<ConvertAssessmentToRealApplicationCommandHandler>>();

        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.AssessmentOnly,
            Status = ApplicationStatus.Evaluating,
            StatementsOfAccount = new List<StatementOfAccount>()
        };

        mockAppRepo.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var ex = new InvalidOperationException("Fatal database error: connection refused at 10.0.0.1:5432");
        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);

        var handler = new ConvertAssessmentToRealApplicationCommandHandler(
            mockAppRepo.Object,
            mockUnitOfWork.Object,
            mockCurrentUserService.Object,
            mockLogger.Object);

        // Act
        var result = await handler.Handle(new ConvertAssessmentToRealApplicationCommand { ApplicationId = appId }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().NotContain("Fatal database error");
        result.Message.Should().NotContain("10.0.0.1:5432");
        result.Message.Should().Be("An unexpected error occurred while converting the application. Please try again later.");

        mockLogger.Verify(
            l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.Is<Exception>(e => e == ex),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task ReprocessAssessment_WhenExceptionThrown_LogsStackTraceAndReturnsSanitizedResponse()
    {
        // Arrange
        var mockAppRepo = new Mock<IApplicationFullRepository>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        var mockCurrentUserService = new Mock<ICurrentUserService>();
        var mockLogger = new Mock<ILogger<ReprocessAssessmentCommandHandler>>();

        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Intent = ApplicationIntent.AssessmentOnly,
            Status = ApplicationStatus.Evaluating,
            AssessmentVersion = 1
        };

        mockAppRepo.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var ex = new InvalidOperationException("Postgres deadlock encountered in transaction table: secret_data");
        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);

        var handler = new ReprocessAssessmentCommandHandler(
            mockAppRepo.Object,
            mockUnitOfWork.Object,
            mockCurrentUserService.Object,
            mockLogger.Object);

        // Act
        var result = await handler.Handle(new ReprocessAssessmentCommand { ApplicationId = appId, Remarks = "Remarks" }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().NotContain("Postgres deadlock");
        result.Message.Should().NotContain("secret_data");
        result.Message.Should().Be("An unexpected error occurred while requesting re-assessment. Please try again later.");

        mockLogger.Verify(
            l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.Is<Exception>(e => e == ex),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateApplication_WhenExceptionThrown_LogsStackTraceAndReturnsSanitizedResponse()
    {
        // Arrange
        var mockAppRepo = new Mock<IApplicationFullRepository>();
        var mockServiceRepo = new Mock<IServiceRepository>();
        var mockElementRepo = new Mock<IServiceVariantElementRepository>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        var mockLogger = new Mock<ILogger<UpdateApplicationCommandHandler>>();

        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.Draft,
            ApplicationApplicants = new List<ApplicationApplicant>()
        };

        mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var ex = new InvalidOperationException("Internal server error: NullReferenceException at Class.Method:123");
        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);

        var handler = new UpdateApplicationCommandHandler(
            mockAppRepo.Object,
            mockServiceRepo.Object,
            mockElementRepo.Object,
            mockUnitOfWork.Object,
            mockLogger.Object);

        // Act
        var result = await handler.Handle(new UpdateApplicationCommand { Id = appId }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().NotContain("NullReferenceException");
        result.Message.Should().NotContain("Class.Method:123");
        result.Message.Should().Be("An unexpected error occurred while updating the application draft. Please try again later.");

        mockLogger.Verify(
            l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.Is<Exception>(e => e == ex),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateApplicationStatus_WhenExceptionThrown_LogsStackTraceAndReturnsSanitizedResponse()
    {
        // Arrange
        var mockAppRepo = new Mock<IApplicationFullRepository>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        var mockCurrentUserService = new Mock<ICurrentUserService>();
        var mockLogger = new Mock<ILogger<UpdateApplicationStatusCommandHandler>>();

        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.Submitted
        };

        mockAppRepo.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var ex = new InvalidOperationException("Database schema error: relation 'applications' column 'invalid_col' does not exist");
        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);

        var handler = new UpdateApplicationStatusCommandHandler(
            mockAppRepo.Object,
            mockUnitOfWork.Object,
            mockCurrentUserService.Object,
            mockLogger.Object);

        // Act
        var result = await handler.Handle(new UpdateApplicationStatusCommand { Id = appId, Status = "Evaluating" }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().NotContain("Database schema error");
        result.Message.Should().NotContain("invalid_col");
        result.Message.Should().Be("An unexpected error occurred while updating the application status. Please try again later.");

        mockLogger.Verify(
            l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.Is<Exception>(e => e == ex),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteDraftApplication_WhenExceptionThrown_LogsStackTraceAndReturnsSanitizedResponse()
    {
        // Arrange
        var mockAppRepo = new Mock<IApplicationFullRepository>();
        var mockUnitOfWork = new Mock<IUnitOfWork>();
        var mockLogger = new Mock<ILogger<DeleteDraftApplicationCommandHandler>>();

        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.Draft
        };

        mockAppRepo.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var ex = new InvalidOperationException("Disk read/write failure on table volume /var/lib/postgresql/data");
        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(ex);

        var handler = new DeleteDraftApplicationCommandHandler(
            mockAppRepo.Object,
            mockUnitOfWork.Object,
            mockLogger.Object);

        // Act
        var result = await handler.Handle(new DeleteDraftApplicationCommand(appId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().NotContain("Disk read/write failure");
        result.Message.Should().NotContain("/var/lib/postgresql/data");
        result.Message.Should().Be("An unexpected error occurred while deleting the draft application. Please try again later.");

        mockLogger.Verify(
            l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.Is<Exception>(e => e == ex),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}
