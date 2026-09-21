using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.UploadApplicantRequirement;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Applications;

public class UploadApplicantRequirementCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _mockAppRepo;
    private readonly Mock<IRequirementRepository> _mockReqRepo;
    private readonly Mock<IServiceRepository> _mockServiceRepo;
    private readonly Mock<ITenantContextService> _mockTenantContext;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly UploadApplicantRequirementCommandHandler _handler;

    public UploadApplicantRequirementCommandHandlerTests()
    {
        _mockAppRepo = new Mock<IApplicationFullRepository>();
        _mockReqRepo = new Mock<IRequirementRepository>();
        _mockServiceRepo = new Mock<IServiceRepository>();
        _mockTenantContext = new Mock<ITenantContextService>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _handler = new UploadApplicantRequirementCommandHandler(
            _mockAppRepo.Object,
            _mockReqRepo.Object,
            _mockServiceRepo.Object,
            _mockTenantContext.Object,
            _mockCurrentUserService.Object,
            _mockUserRepo.Object,
            _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ApplicationNotFound_ReturnsFailure()
    {
        // Arrange
        var appId = Guid.NewGuid();
        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = appId,
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not found");
    }

    [Fact]
    public async Task Handle_UnauthorizedUser_NotMemberNotOwnerNotSuperAdmin_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var ownerUserId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            UserId = ownerUserId,
            CreatedBy = ownerUserId.ToString(),
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _mockTenantContext.Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mockTenantContext.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mockCurrentUserService.Setup(u => u.UserId)
            .Returns(Guid.NewGuid().ToString()); // different user

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            RequirementId = Guid.NewGuid(),
            StoredFileId = Guid.NewGuid()
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("do not have permission");
    }

    [Fact]
    public async Task Handle_ApplicationOwner_CanUploadRequirementSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var ownerUserId = Guid.NewGuid();
        var reqId = Guid.NewGuid();
        var storedFileId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            TenantId = tenantId,
            UserId = ownerUserId
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            UserId = ownerUserId,
            CreatedBy = ownerUserId.ToString(),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new() { ApplicationId = appId, ApplicantId = applicantId, Applicant = applicant }
            },
            ApplicationRequirements = new List<ApplicationRequirement>()
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _mockAppRepo.Setup(r => r.GetApplicantRequirementsAsync(appId, applicantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationRequirement>());
        _mockTenantContext.Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false); // not staff member of tenant
        _mockTenantContext.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mockCurrentUserService.Setup(u => u.UserId)
            .Returns(ownerUserId.ToString()); // is application owner

        _mockReqRepo.Setup(r => r.GetRequirementByIdAsync(reqId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Requirement { Id = reqId, Name = "Valid ID" });

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            RequirementId = reqId,
            StoredFileId = storedFileId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Contain("uploaded successfully");
        _mockAppRepo.Verify(r => r.AddApplicationRequirementAsync(It.IsAny<ApplicationRequirement>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ExistingRequirement_UpdatesRequirementSuccessfully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var ownerUserId = Guid.NewGuid();
        var reqId = Guid.NewGuid();
        var initialStoredFileId = Guid.NewGuid();
        var newStoredFileId = Guid.NewGuid();
        var existingRequirementId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            TenantId = tenantId,
            UserId = ownerUserId
        };

        var existingRequirement = new ApplicationRequirement
        {
            Id = existingRequirementId,
            ApplicationId = appId,
            ApplicantId = applicantId,
            RequirementId = reqId,
            StoredFileId = initialStoredFileId,
            TenantId = tenantId,
            Url = $"/api/v2/tenants/{tenantId}/storage/files/{initialStoredFileId}"
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            UserId = ownerUserId,
            CreatedBy = ownerUserId.ToString(),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new() { ApplicationId = appId, ApplicantId = applicantId, Applicant = applicant }
            },
            ApplicationRequirements = new List<ApplicationRequirement>
            {
                existingRequirement
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _mockAppRepo.Setup(r => r.GetApplicantRequirementsAsync(appId, applicantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationRequirement> { existingRequirement });
        _mockTenantContext.Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockReqRepo.Setup(r => r.GetRequirementByIdAsync(reqId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Requirement { Id = reqId, Name = "Valid ID" });

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            RequirementId = reqId,
            StoredFileId = newStoredFileId
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(existingRequirementId);
        existingRequirement.StoredFileId.Should().Be(newStoredFileId);
        existingRequirement.Url.Should().Contain(newStoredFileId.ToString());
        _mockUnitOfWork.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
