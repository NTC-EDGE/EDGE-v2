using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Applications.Queries.GetApplicationActivities;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class GetApplicationActivitiesQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _mockRepo;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IUserAuthorizationService> _mockAuthService;
    private readonly Mock<ITenantContextService> _mockTenantContextService;
    private readonly Mock<ITenantMemberRepository> _mockTenantMemberRepo;
    private readonly Mock<IFieldOfficeRepository> _mockFieldOfficeRepo;
    private readonly GetApplicationActivitiesQueryHandler _handler;

    public GetApplicationActivitiesQueryHandlerTests()
    {
        _mockRepo = new Mock<IApplicationFullRepository>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockAuthService = new Mock<IUserAuthorizationService>();
        _mockTenantContextService = new Mock<ITenantContextService>();
        _mockTenantMemberRepo = new Mock<ITenantMemberRepository>();
        _mockFieldOfficeRepo = new Mock<IFieldOfficeRepository>();

        _handler = new GetApplicationActivitiesQueryHandler(
            _mockRepo.Object,
            _mockCurrentUserService.Object,
            _mockUserRepo.Object,
            _mockAuthService.Object,
            _mockTenantContextService.Object,
            _mockTenantMemberRepo.Object,
            _mockFieldOfficeRepo.Object
        );
    }

    [Fact]
    public async Task Handle_UnauthorizedUser_ReturnsFailResponse()
    {
        // Arrange
        _mockCurrentUserService.Setup(u => u.UserId).Returns((string?)null);

        var query = new GetApplicationActivitiesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("401");
    }

    [Fact]
    public async Task Handle_StaffUser_InvokesGetApplicationActivitiesPagedAsync_AndReturnsSuccess()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockCurrentUserService.Setup(u => u.IsAdminClaim).Returns(true);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var expectedDto = new PagedApplicationActivitiesDto
        {
            PageNumber = 1,
            PageSize = 15,
            TotalCount = 1,
            Items = new List<ApplicationActivityDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ApplicationNumber = "APP-2026-0001",
                    Status = ApplicationStatus.Submitted.ToString()
                }
            }
        };

        _mockRepo.Setup(r => r.GetApplicationActivitiesPagedAsync(
            It.IsAny<ApplicationStatus?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<List<Guid>?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()
        )).ReturnsAsync(expectedDto);

        var query = new GetApplicationActivitiesQuery(
            QueueTab: "activity",
            Scope: "queue",
            PageNumber: 1,
            PageSize: 15,
            Role: "Admin",
            AssignedTo: "Officer Name"
        );

        // Act
        var response = await _handler.Handle(query, CancellationToken.None);

        // Assert
        response.Succeeded.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Items.Should().HaveCount(1);
        response.Data.Items[0].ApplicationNumber.Should().Be("APP-2026-0001");
        _mockRepo.Verify(r => r.GetApplicationActivitiesPagedAsync(
            null,
            "activity",
            "queue",
            null,
            null,
            1,
            15,
            null,
            null,
            null,
            null,
            null,
            "Officer Name",
            "Admin",
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task Handle_RegularStaff_FieldOfficeScoped_PassesEffectiveFieldOfficeToRepository()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var fieldOfficeId = Guid.NewGuid();
        var fieldOfficeName = "NTC Field Office 1 - Iligan";

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockCurrentUserService.Setup(u => u.IsAdminClaim).Returns(false);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _mockTenantContextService.Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var evaluatorRole = new Role { Id = Guid.NewGuid(), Key = "evaluator", Name = "Evaluating Officer" };
        var fieldOffice = new FieldOffice { Id = fieldOfficeId, TenantId = tenantId, Name = fieldOfficeName };
        var membership = new TenantMember
        {
            TenantId = tenantId,
            UserId = userId,
            RoleId = evaluatorRole.Id,
            Role = evaluatorRole,
            FieldOfficeId = fieldOfficeId,
            FieldOffice = fieldOffice
        };

        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(membership);

        string? capturedFieldOffice = null;
        _mockRepo.Setup(r => r.GetApplicationActivitiesPagedAsync(
            It.IsAny<ApplicationStatus?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<List<Guid>?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()
        )).Callback<ApplicationStatus?, string?, string?, Guid?, string?, int, int, string?, string?, Guid?, List<Guid>?, string?, string?, string?, CancellationToken>(
            (st, qt, sc, uid, em, pn, ps, stm, md, tid, tids, fo, at, rl, ct) => capturedFieldOffice = fo
        ).ReturnsAsync(new PagedApplicationActivitiesDto());

        var query = new GetApplicationActivitiesQuery(
            TenantId: tenantId,
            QueueTab: "activity",
            Scope: "queue",
            Role: "Evaluator"
        );

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedFieldOffice.Should().Be(fieldOfficeName);
    }

    [Fact]
    public async Task Handle_DefaultPagination_UsesPageNumber1AndPageSize15()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockCurrentUserService.Setup(u => u.IsAdminClaim).Returns(true);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);

        int capturedPageNumber = 0;
        int capturedPageSize = 0;
        _mockRepo.Setup(r => r.GetApplicationActivitiesPagedAsync(
            It.IsAny<ApplicationStatus?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<List<Guid>?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()
        )).Callback<ApplicationStatus?, string?, string?, Guid?, string?, int, int, string?, string?, Guid?, List<Guid>?, string?, string?, string?, CancellationToken>(
            (st, qt, sc, uid, em, pn, ps, stm, md, tid, tids, fo, at, rl, ct) =>
            {
                capturedPageNumber = pn;
                capturedPageSize = ps;
            }
        ).ReturnsAsync(new PagedApplicationActivitiesDto());

        var query = new GetApplicationActivitiesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedPageNumber.Should().Be(1);
        capturedPageSize.Should().Be(15);
    }

    [Fact]
    public async Task Handle_RegularUser_ScopeMine_FiltersByCurrentUserId()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockCurrentUserService.Setup(u => u.IsAdminClaim).Returns(false);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);

        Guid? capturedUserId = null;
        _mockRepo.Setup(r => r.GetApplicationActivitiesPagedAsync(
            It.IsAny<ApplicationStatus?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>(),
            It.IsAny<int>(),
            It.IsAny<int>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<Guid?>(),
            It.IsAny<List<Guid>?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<string?>(),
            It.IsAny<CancellationToken>()
        )).Callback<ApplicationStatus?, string?, string?, Guid?, string?, int, int, string?, string?, Guid?, List<Guid>?, string?, string?, string?, CancellationToken>(
            (st, qt, sc, uid, em, pn, ps, stm, md, tid, tids, fo, at, rl, ct) => capturedUserId = uid
        ).ReturnsAsync(new PagedApplicationActivitiesDto());

        var query = new GetApplicationActivitiesQuery(Scope: "mine");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedUserId.Should().Be(userId);
    }
}

