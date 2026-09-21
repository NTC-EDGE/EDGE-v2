using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.FinalizeApplicationSubmission;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class FinalizeApplicationSubmissionCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _mockAppRepo;
    private readonly Mock<IRequirementRepository> _mockReqRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<ITenantContextService> _mockTenantContextService;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IUserAuthorizationService> _mockUserAuthService;
    private readonly FinalizeApplicationSubmissionCommandHandler _handler;

    public FinalizeApplicationSubmissionCommandHandlerTests()
    {
        _mockAppRepo = new Mock<IApplicationFullRepository>();
        _mockReqRepo = new Mock<IRequirementRepository>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockTenantContextService = new Mock<ITenantContextService>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockUserAuthService = new Mock<IUserAuthorizationService>();

        _mockUserAuthService.Setup(a => a.CanSubmitApplicationAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new FinalizeApplicationSubmissionCommandHandler(
            _mockAppRepo.Object,
            _mockReqRepo.Object,
            _mockUserRepo.Object,
            _mockCurrentUserService.Object,
            _mockTenantContextService.Object,
            _mockUnitOfWork.Object,
            _mockUserAuthService.Object);
    }

    [Fact]
    public async Task Handle_ApplicationNotFound_ReturnsFailure()
    {
        // Arrange
        var appId = Guid.NewGuid();
        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        var command = new FinalizeApplicationSubmissionCommand(appId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not found");
    }

    [Fact]
    public async Task Handle_ApplicationNotInDraft_ReturnsFailure()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Status = ApplicationStatus.Submitted
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var command = new FinalizeApplicationSubmissionCommand(appId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not in Draft state");
    }

    [Fact]
    public async Task Handle_ValidDraftByOwner_FinalizesAndSetsSubmittedStatus()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var ownerUserId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            TenantId = tenantId,
            UserId = ownerUserId,
            ApplicantDetail = new ApplicantDetail
            {
                FirstName = "John",
                LastName = "Doe",
                ContactNumber = "09171234567"
            }
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            UserId = ownerUserId,
            CreatedBy = ownerUserId.ToString(),
            Status = ApplicationStatus.Draft,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new() { ApplicationId = appId, ApplicantId = applicantId, SequenceOrder = 1, Applicant = applicant }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _mockAppRepo.Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _mockTenantContextService.Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mockCurrentUserService.Setup(u => u.UserId)
            .Returns(ownerUserId.ToString());

        var command = new FinalizeApplicationSubmissionCommand(appId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Contain("finalized and submitted successfully");
        app.Status.Should().Be(ApplicationStatus.Submitted);
        app.ApplicationNumber.Should().StartWith("APP-");
        _mockAppRepo.Verify(r => r.UpdateAsync(app, It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
