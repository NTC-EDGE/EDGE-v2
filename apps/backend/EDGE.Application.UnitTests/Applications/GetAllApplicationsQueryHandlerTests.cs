using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Applications.Queries.GetAllApplications;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Applications;

public class GetAllApplicationsQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _mockRepo;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IUserAuthorizationService> _mockAuthService;
    private readonly Mock<ITenantContextService> _mockTenantContextService;
    private readonly Mock<ITenantMemberRepository> _mockTenantMemberRepo;
    private readonly Mock<IFieldOfficeRepository> _mockFieldOfficeRepo;
    private readonly GetAllApplicationsQueryHandler _handler;

    public GetAllApplicationsQueryHandlerTests()
    {
        _mockRepo = new Mock<IApplicationFullRepository>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockAuthService = new Mock<IUserAuthorizationService>();
        _mockTenantContextService = new Mock<ITenantContextService>();
        _mockTenantMemberRepo = new Mock<ITenantMemberRepository>();
        _mockFieldOfficeRepo = new Mock<IFieldOfficeRepository>();

        _handler = new GetAllApplicationsQueryHandler(
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
    public async Task Handle_RegularStaff_EvaluatorInFieldOffice1_IsScopedToFieldOffice1()
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
        _mockRepo.Setup(r => r.GetPagedApplicationSummaryDtosAsync(
            It.IsAny<EDGE.Domain.Enums.ApplicationStatus?>(),
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
        )).Callback<EDGE.Domain.Enums.ApplicationStatus?, string?, string?, Guid?, string?, int, int, string?, string?, Guid?, List<Guid>?, string?, string?, string?, CancellationToken>(
            (st, qt, sc, uid, em, pn, ps, stm, md, tid, tids, fo, at, rl, ct) => capturedFieldOffice = fo
        ).ReturnsAsync(new PagedApplicationListDto());

        var query = new GetAllApplicationsQuery
        {
            TenantId = tenantId,
            QueueTab = "pending",
            Scope = "queue",
            Role = "evaluator"
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedFieldOffice.Should().Be(fieldOfficeName);
    }

    [Fact]
    public async Task Handle_RegionalDirectorOrAdmin_HasGlobalTenantVisibility_NotRestrictedToFieldOffice()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var fieldOfficeId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockCurrentUserService.Setup(u => u.IsAdminClaim).Returns(false);
        _mockTenantContextService.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _mockTenantContextService.Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var directorRole = new Role { Id = Guid.NewGuid(), Key = "regionaldirector", Name = "Regional Director" };
        var fieldOffice = new FieldOffice { Id = fieldOfficeId, TenantId = tenantId, Name = "Field Office 1" };
        var membership = new TenantMember
        {
            TenantId = tenantId,
            UserId = userId,
            RoleId = directorRole.Id,
            Role = directorRole,
            FieldOfficeId = fieldOfficeId,
            FieldOffice = fieldOffice
        };

        _mockTenantMemberRepo.Setup(m => m.GetByTenantAndUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(membership);

        string? capturedFieldOffice = "INITIAL";
        _mockRepo.Setup(r => r.GetPagedApplicationSummaryDtosAsync(
            It.IsAny<EDGE.Domain.Enums.ApplicationStatus?>(),
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
        )).Callback<EDGE.Domain.Enums.ApplicationStatus?, string?, string?, Guid?, string?, int, int, string?, string?, Guid?, List<Guid>?, string?, string?, string?, CancellationToken>(
            (st, qt, sc, uid, em, pn, ps, stm, md, tid, tids, fo, at, rl, ct) => capturedFieldOffice = fo
        ).ReturnsAsync(new PagedApplicationListDto());

        var query = new GetAllApplicationsQuery
        {
            TenantId = tenantId,
            QueueTab = "pending",
            Scope = "queue",
            Role = "regionaldirector"
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedFieldOffice.Should().BeNull(); // Admin & Regional Director see all field offices in the region
    }
}
