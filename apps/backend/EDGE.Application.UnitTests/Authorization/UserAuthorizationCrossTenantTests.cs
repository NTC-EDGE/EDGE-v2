using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Services;

namespace EDGE.Application.UnitTests.Authorization;

public class UserAuthorizationCrossTenantTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ILogger<UserAuthorizationService>> _loggerMock = new();

    public UserAuthorizationCrossTenantTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"AuthCrossTenantTests_{Guid.NewGuid()}")
            .Options;
        _dbContext = new ApplicationDbContext(options);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task SuperAdminUser_ShouldHaveAllPermissions_AcrossAnyTenant()
    {
        // Arrange
        var superAdminUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_superadmin_01",
            Email = "superadmin@ntcedge.com",
            IsSuperAdmin = true,
            IsDeleted = false
        };
        _dbContext.Users.Add(superAdminUser);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_superadmin_01");
        _currentUserServiceMock.Setup(s => s.Email).Returns("superadmin@ntcedge.com");
        _currentUserServiceMock.Setup(s => s.IsSuperAdminClaim).Returns(true);
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(superAdminUser);

        // Cross tenant context (e.g. requesting tenant 2)
        var requestedTenantId = Guid.NewGuid();
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(requestedTenantId);

        var service = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        // Act
        var hasManageMembers = await service.HasPermissionAsync(Permissions.ManageTenantMembers);
        var hasViewAllApps = await service.HasPermissionAsync(Permissions.ViewAllApplications);
        var permissions = await service.GetUserPermissionsAsync();

        // Assert
        hasManageMembers.Should().BeTrue("SuperAdmin has ManageTenantMembers across any tenant context");
        hasViewAllApps.Should().BeTrue("SuperAdmin has ViewAllApplications across any tenant context");
        permissions.Should().BeEquivalentTo(Permissions.AllKeys);
    }

    [Fact]
    public async Task TenantAdmin_WithAdminRoleInMembership_ShouldHaveAllPermissions_InTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_tenant_admin_01",
            Email = "admin@ntcedge.com",
            IsSuperAdmin = false,
            IsDeleted = false
        };
        var adminRole = new Role
        {
            Id = Guid.NewGuid(),
            Key = "admin",
            Name = "Tenant Administrator",
            TenantId = tenantId,
            IsDeleted = false
        };
        var membership = new TenantMember
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = adminUser.Id,
            RoleId = adminRole.Id,
            IsDeleted = false
        };

        _dbContext.Users.Add(adminUser);
        _dbContext.Roles.Add(adminRole);
        _dbContext.TenantMembers.Add(membership);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_tenant_admin_01");
        _currentUserServiceMock.Setup(s => s.Email).Returns("admin@ntcedge.com");
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(adminUser);
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(tenantId);

        var service = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        // Act
        var hasManageMembers = await service.HasPermissionAsync(Permissions.ManageTenantMembers);
        var isInternal = await service.IsInternalUserAsync();

        // Assert
        hasManageMembers.Should().BeTrue("Tenant Admin has ManageTenantMembers permission");
        isInternal.Should().BeTrue("Tenant Admin is recognized as internal user");
    }

    [Fact]
    public async Task RegionalDirector_WithAssignedPermissions_ShouldHaveManageMembersInAssignedTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var directorUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_director_01",
            Email = "director.r1@ntcedge.com",
            IsSuperAdmin = false,
            IsDeleted = false
        };
        var directorRole = new Role
        {
            Id = Guid.NewGuid(),
            Key = "regional_director",
            Name = "Regional Director",
            TenantId = tenantId,
            IsDeleted = false
        };
        var membership = new TenantMember
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = directorUser.Id,
            RoleId = directorRole.Id,
            IsDeleted = false
        };
        var permission = new RolePermission
        {
            RoleId = directorRole.Id,
            PermissionKey = Permissions.ManageTenantMembers
        };

        _dbContext.Users.Add(directorUser);
        _dbContext.Roles.Add(directorRole);
        _dbContext.TenantMembers.Add(membership);
        _dbContext.RolePermissions.Add(permission);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_director_01");
        _currentUserServiceMock.Setup(s => s.Email).Returns("director.r1@ntcedge.com");
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(directorUser);
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(tenantId);

        var service = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        // Act
        var hasManageMembers = await service.HasPermissionAsync(Permissions.ManageTenantMembers);
        var hasRole = await service.HasRoleAsync("Regional Director");

        // Assert
        hasManageMembers.Should().BeTrue("Regional Director has ManageTenantMembers permission in assigned tenant");
        hasRole.Should().BeTrue("Regional Director matches administrative role check");
    }

    [Fact]
    public async Task RegularStaff_InTenantA_ShouldNotHavePermissions_InUnassignedTenantB()
    {
        // Arrange
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();

        var staffUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_evaluator_01",
            Email = "evaluator.r1@ntcedge.com",
            IsSuperAdmin = false,
            IsDeleted = false
        };
        var evaluatorRole = new Role
        {
            Id = Guid.NewGuid(),
            Key = "evaluator",
            Name = "Evaluator",
            TenantId = tenantA,
            IsDeleted = false
        };
        var membershipTenantA = new TenantMember
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            UserId = staffUser.Id,
            RoleId = evaluatorRole.Id,
            IsDeleted = false
        };
        var rolePermission = new RolePermission
        {
            RoleId = evaluatorRole.Id,
            PermissionKey = Permissions.EvaluateApplication
        };

        _dbContext.Users.Add(staffUser);
        _dbContext.Roles.Add(evaluatorRole);
        _dbContext.TenantMembers.Add(membershipTenantA);
        _dbContext.RolePermissions.Add(rolePermission);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_evaluator_01");
        _currentUserServiceMock.Setup(s => s.Email).Returns("evaluator.r1@ntcedge.com");
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(staffUser);

        // Scenario 1: Requesting Tenant A (assigned)
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(tenantA);

        var serviceTenantA = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        var canEvaluateTenantA = await serviceTenantA.HasPermissionAsync(Permissions.EvaluateApplication);
        canEvaluateTenantA.Should().BeTrue("Staff member can evaluate applications in assigned Tenant A");

        // Scenario 2: Requesting Tenant B (cross-tenant, unassigned)
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(tenantB);

        var serviceTenantB = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        var canEvaluateTenantB = await serviceTenantB.HasPermissionAsync(Permissions.EvaluateApplication);
        canEvaluateTenantB.Should().BeFalse("Non-admin staff member cannot evaluate applications in unassigned Tenant B");
    }

    [Fact]
    public async Task EndToEnd_FullApplicationLifecycle_AllRolesHaveRequiredPermissionsWithout403Blockers()
    {
        // ── 1. Client Step (Submit Application) ───────────────────────────────
        var clientUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_client_e2e",
            Email = "client.e2e@example.com",
            IsSuperAdmin = false,
            IsDeleted = false
        };
        _dbContext.Users.Add(clientUser);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_client_e2e");
        _currentUserServiceMock.Setup(s => s.Email).Returns("client.e2e@example.com");
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(clientUser);
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns((Guid?)null);

        var clientAuthService = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        var canClientSubmit = await clientAuthService.CanSubmitApplicationAsync();
        var clientHasSubmitPerm = await clientAuthService.HasPermissionAsync(Permissions.SubmitApplication);
        var clientHasReadPerm = await clientAuthService.HasPermissionAsync(Permissions.ReadApplication);

        canClientSubmit.Should().BeTrue("Client must be allowed to submit applications");
        clientHasSubmitPerm.Should().BeTrue("Client has SubmitApplication permission");
        clientHasReadPerm.Should().BeTrue("Client has ReadApplication permission to inspect submission status");

        // ── 2. Evaluator Step (Evaluate & Generate SOA) ───────────────────────
        var tenantId = Guid.NewGuid();
        var evaluatorUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_evaluator_e2e",
            Email = "evaluator.e2e@ntcedge.com",
            IsSuperAdmin = false,
            IsDeleted = false
        };
        var evaluatorRole = new Role
        {
            Id = Guid.NewGuid(),
            Key = "evaluator",
            Name = "Evaluator",
            TenantId = tenantId,
            IsDeleted = false
        };
        var evaluatorMembership = new TenantMember
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = evaluatorUser.Id,
            RoleId = evaluatorRole.Id,
            IsDeleted = false
        };

        var evaluatorPermissions = new[]
        {
            Permissions.EvaluateApplication,
            Permissions.CreateBilling,
            Permissions.UpdateApplication,
            Permissions.ReadApplication,
            Permissions.ViewAllApplications
        }.Select(k => new RolePermission { RoleId = evaluatorRole.Id, PermissionKey = k });

        _dbContext.Users.Add(evaluatorUser);
        _dbContext.Roles.Add(evaluatorRole);
        _dbContext.TenantMembers.Add(evaluatorMembership);
        _dbContext.RolePermissions.AddRange(evaluatorPermissions);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_evaluator_e2e");
        _currentUserServiceMock.Setup(s => s.Email).Returns("evaluator.e2e@ntcedge.com");
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(evaluatorUser);
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(tenantId);

        var evaluatorAuthService = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        var canEvaluate = await evaluatorAuthService.HasPermissionAsync(Permissions.EvaluateApplication);
        var canCreateBilling = await evaluatorAuthService.HasPermissionAsync(Permissions.CreateBilling);
        var canUpdateStatusToAccountant = await evaluatorAuthService.HasPermissionAsync(Permissions.UpdateApplication);

        canEvaluate.Should().BeTrue("Evaluator must have EvaluateApplication permission");
        canCreateBilling.Should().BeTrue("Evaluator must have CreateBilling permission to generate SOA");
        canUpdateStatusToAccountant.Should().BeTrue("Evaluator must have UpdateApplication permission to advance status to ForAccountant");

        // ── 3. Accountant Step (Verify & Approve SOA) ─────────────────────────
        var accountantUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_accountant_e2e",
            Email = "accountant.e2e@ntcedge.com",
            IsSuperAdmin = false,
            IsDeleted = false
        };
        var accountantRole = new Role
        {
            Id = Guid.NewGuid(),
            Key = "accountant",
            Name = "Accountant",
            TenantId = tenantId,
            IsDeleted = false
        };
        var accountantMembership = new TenantMember
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = accountantUser.Id,
            RoleId = accountantRole.Id,
            IsDeleted = false
        };

        var accountantPermissions = new[]
        {
            Permissions.ApproveSoa,
            Permissions.ReturnSoa,
            Permissions.UpdateApplication,
            Permissions.ReadApplication,
            Permissions.ViewAllApplications
        }.Select(k => new RolePermission { RoleId = accountantRole.Id, PermissionKey = k });

        _dbContext.Users.Add(accountantUser);
        _dbContext.Roles.Add(accountantRole);
        _dbContext.TenantMembers.Add(accountantMembership);
        _dbContext.RolePermissions.AddRange(accountantPermissions);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_accountant_e2e");
        _currentUserServiceMock.Setup(s => s.Email).Returns("accountant.e2e@ntcedge.com");
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(accountantUser);
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(tenantId);

        var accountantAuthService = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        var canApproveSoa = await accountantAuthService.HasPermissionAsync(Permissions.ApproveSoa);
        var canReturnSoa = await accountantAuthService.HasPermissionAsync(Permissions.ReturnSoa);
        var canUpdateStatusToPendingPayment = await accountantAuthService.HasPermissionAsync(Permissions.UpdateApplication);

        canApproveSoa.Should().BeTrue("Accountant must have ApproveSoa permission");
        canReturnSoa.Should().BeTrue("Accountant must have ReturnSoa permission");
        canUpdateStatusToPendingPayment.Should().BeTrue("Accountant must have UpdateApplication permission to advance status to PendingPayment");

        // ── 4. Cashier Step (Collect Payment & Issue Receipt) ─────────────────
        var cashierUser = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_cashier_e2e",
            Email = "cashier.e2e@ntcedge.com",
            IsSuperAdmin = false,
            IsDeleted = false
        };
        var cashierRole = new Role
        {
            Id = Guid.NewGuid(),
            Key = "cashier",
            Name = "Cashier",
            TenantId = tenantId,
            IsDeleted = false
        };
        var cashierMembership = new TenantMember
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = cashierUser.Id,
            RoleId = cashierRole.Id,
            IsDeleted = false
        };

        var cashierPermissions = new[]
        {
            Permissions.CollectPayment,
            Permissions.ReturnOp,
            Permissions.ReceiptsIssue,
            Permissions.ReceiptsRead,
            Permissions.UpdateApplication,
            Permissions.ReadApplication
        }.Select(k => new RolePermission { RoleId = cashierRole.Id, PermissionKey = k });

        _dbContext.Users.Add(cashierUser);
        _dbContext.Roles.Add(cashierRole);
        _dbContext.TenantMembers.Add(cashierMembership);
        _dbContext.RolePermissions.AddRange(cashierPermissions);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_cashier_e2e");
        _currentUserServiceMock.Setup(s => s.Email).Returns("cashier.e2e@ntcedge.com");
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(cashierUser);
        _tenantContextServiceMock.Setup(t => t.TenantId).Returns(tenantId);

        var cashierAuthService = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        var canCollectPayment = await cashierAuthService.HasPermissionAsync(Permissions.CollectPayment);
        var canIssueReceipt = await cashierAuthService.HasPermissionAsync(Permissions.ReceiptsIssue);
        var canCompleteApplication = await cashierAuthService.HasPermissionAsync(Permissions.UpdateApplication);

        canCollectPayment.Should().BeTrue("Cashier must have CollectPayment permission");
        canIssueReceipt.Should().BeTrue("Cashier must have ReceiptsIssue permission");
        canCompleteApplication.Should().BeTrue("Cashier must have UpdateApplication permission to complete application");

        // ── 5. SuperAdmin Step (Root Access Across Every Step) ────────────────
        var superAdmin = new User
        {
            Id = Guid.NewGuid(),
            AuthUserId = "user_superadmin_root",
            Email = "superadmin@ntcedge.com",
            IsSuperAdmin = true,
            IsDeleted = false
        };
        _dbContext.Users.Add(superAdmin);
        await _dbContext.SaveChangesAsync();

        _currentUserServiceMock.Setup(s => s.UserId).Returns("user_superadmin_root");
        _currentUserServiceMock.Setup(s => s.Email).Returns("superadmin@ntcedge.com");
        _currentUserServiceMock.Setup(s => s.IsSuperAdminClaim).Returns(true);
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(It.IsAny<ICurrentUserService>(), default))
            .ReturnsAsync(superAdmin);

        var superAdminAuthService = new UserAuthorizationService(
            _currentUserServiceMock.Object,
            _tenantContextServiceMock.Object,
            _userRepositoryMock.Object,
            _dbContext,
            _loggerMock.Object);

        foreach (var requiredPerm in new[]
        {
            Permissions.SubmitApplication,
            Permissions.EvaluateApplication,
            Permissions.CreateBilling,
            Permissions.ApproveSoa,
            Permissions.ReturnSoa,
            Permissions.CollectPayment,
            Permissions.ReceiptsIssue,
            Permissions.UpdateApplication,
            Permissions.ManageTenantMembers
        })
        {
            var hasPerm = await superAdminAuthService.HasPermissionAsync(requiredPerm);
            hasPerm.Should().BeTrue($"SuperAdmin must have {requiredPerm} unconditionally");
        }
    }
}
