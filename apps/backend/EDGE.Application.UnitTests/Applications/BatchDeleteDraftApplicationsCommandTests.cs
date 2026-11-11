using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.BatchDeleteDraftApplications;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class BatchDeleteDraftApplicationsCommandTests
{
    private readonly Mock<IApplicationFullRepository> _mockAppRepo = new();
    private readonly Mock<IUnitOfWork> _mockUnitOfWork = new();
    private readonly Mock<ILogger<BatchDeleteDraftApplicationsCommandHandler>> _mockLogger = new();

    [Fact]
    public void Validator_WhenIdsNullOrEmpty_FailsValidation()
    {
        var validator = new BatchDeleteDraftApplicationsCommandValidator();

        var nullResult = validator.Validate(new BatchDeleteDraftApplicationsCommand(null!));
        nullResult.IsValid.Should().BeFalse();
        nullResult.Errors.Should().Contain(e => e.PropertyName == "Ids");

        var emptyResult = validator.Validate(new BatchDeleteDraftApplicationsCommand(new List<Guid>()));
        emptyResult.IsValid.Should().BeFalse();
        emptyResult.Errors.Should().Contain(e => e.PropertyName == "Ids");
    }

    [Fact]
    public void Validator_WhenIdsContainsGuids_PassesValidation()
    {
        var validator = new BatchDeleteDraftApplicationsCommandValidator();
        var command = new BatchDeleteDraftApplicationsCommand(new List<Guid> { Guid.NewGuid(), Guid.NewGuid() });

        var result = validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WhenIdsEmpty_ReturnsFailWithoutStartingTransaction()
    {
        var handler = new BatchDeleteDraftApplicationsCommandHandler(
            _mockAppRepo.Object,
            _mockUnitOfWork.Object,
            _mockLogger.Object);

        var result = await handler.Handle(new BatchDeleteDraftApplicationsCommand(new List<Guid>()), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("No draft application IDs provided");
        _mockUnitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenAllDraftsExist_DeletesAllAndCommitsTransaction()
    {
        var id1 = Guid.NewGuid();
        var id2 = Guid.NewGuid();
        var draft1 = new Domain.Entities.Application { Id = id1, Status = ApplicationStatus.Draft };
        var draft2 = new Domain.Entities.Application { Id = id2, Status = ApplicationStatus.Draft };

        _mockAppRepo.Setup(r => r.GetByIdAsync(id1, It.IsAny<CancellationToken>())).ReturnsAsync(draft1);
        _mockAppRepo.Setup(r => r.GetByIdAsync(id2, It.IsAny<CancellationToken>())).ReturnsAsync(draft2);

        var handler = new BatchDeleteDraftApplicationsCommandHandler(
            _mockAppRepo.Object,
            _mockUnitOfWork.Object,
            _mockLogger.Object);

        var command = new BatchDeleteDraftApplicationsCommand(new List<Guid> { id1, id2 });
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(2);
        result.Message.Should().Contain("2 draft application(s) deleted successfully");

        _mockAppRepo.Verify(r => r.DeleteAsync(draft1, It.IsAny<CancellationToken>()), Times.Once);
        _mockAppRepo.Verify(r => r.DeleteAsync(draft2, It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenSomeApplicationsAreNotDraft_DeletesOnlyDrafts()
    {
        var draftId = Guid.NewGuid();
        var submittedId = Guid.NewGuid();
        var draftApp = new Domain.Entities.Application { Id = draftId, Status = ApplicationStatus.Draft };
        var submittedApp = new Domain.Entities.Application { Id = submittedId, Status = ApplicationStatus.Submitted };

        _mockAppRepo.Setup(r => r.GetByIdAsync(draftId, It.IsAny<CancellationToken>())).ReturnsAsync(draftApp);
        _mockAppRepo.Setup(r => r.GetByIdAsync(submittedId, It.IsAny<CancellationToken>())).ReturnsAsync(submittedApp);

        var handler = new BatchDeleteDraftApplicationsCommandHandler(
            _mockAppRepo.Object,
            _mockUnitOfWork.Object,
            _mockLogger.Object);

        var command = new BatchDeleteDraftApplicationsCommand(new List<Guid> { draftId, submittedId });
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(1);
        result.Message.Should().Contain("1 draft application(s) deleted successfully");

        _mockAppRepo.Verify(r => r.DeleteAsync(draftApp, It.IsAny<CancellationToken>()), Times.Once);
        _mockAppRepo.Verify(r => r.DeleteAsync(submittedApp, It.IsAny<CancellationToken>()), Times.Never);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenApplicationsAlreadyDeletedOrNotFound_SkipsGracefullyAndReturnsDeletedCount()
    {
        var existingDraftId = Guid.NewGuid();
        var missingDraftId = Guid.NewGuid();
        var draftApp = new Domain.Entities.Application { Id = existingDraftId, Status = ApplicationStatus.Draft };

        _mockAppRepo.Setup(r => r.GetByIdAsync(existingDraftId, It.IsAny<CancellationToken>())).ReturnsAsync(draftApp);
        _mockAppRepo.Setup(r => r.GetByIdAsync(missingDraftId, It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Entities.Application?)null);

        var handler = new BatchDeleteDraftApplicationsCommandHandler(
            _mockAppRepo.Object,
            _mockUnitOfWork.Object,
            _mockLogger.Object);

        var command = new BatchDeleteDraftApplicationsCommand(new List<Guid> { existingDraftId, missingDraftId });
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(1);
        result.Message.Should().Contain("1 draft application(s) deleted successfully");
        _mockAppRepo.Verify(r => r.DeleteAsync(draftApp, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenDuplicateIdsProvided_DeduplicatesAndDeletesOnlyOnce()
    {
        var draftId = Guid.NewGuid();
        var draftApp = new Domain.Entities.Application { Id = draftId, Status = ApplicationStatus.Draft };

        _mockAppRepo.Setup(r => r.GetByIdAsync(draftId, It.IsAny<CancellationToken>())).ReturnsAsync(draftApp);

        var handler = new BatchDeleteDraftApplicationsCommandHandler(
            _mockAppRepo.Object,
            _mockUnitOfWork.Object,
            _mockLogger.Object);

        // Send duplicate ID in batch
        var command = new BatchDeleteDraftApplicationsCommand(new List<Guid> { draftId, draftId, draftId });
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(1);
        _mockAppRepo.Verify(r => r.DeleteAsync(draftApp, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenDatabaseSaveFails_RollsBackTransactionAndReturnsFail()
    {
        var draftId = Guid.NewGuid();
        var draftApp = new Domain.Entities.Application { Id = draftId, Status = ApplicationStatus.Draft };

        _mockAppRepo.Setup(r => r.GetByIdAsync(draftId, It.IsAny<CancellationToken>())).ReturnsAsync(draftApp);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Simulated DB collision"));

        var handler = new BatchDeleteDraftApplicationsCommandHandler(
            _mockAppRepo.Object,
            _mockUnitOfWork.Object,
            _mockLogger.Object);

        var command = new BatchDeleteDraftApplicationsCommand(new List<Guid> { draftId });
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("An unexpected error occurred while deleting draft applications");

        _mockUnitOfWork.Verify(u => u.RollbackTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
