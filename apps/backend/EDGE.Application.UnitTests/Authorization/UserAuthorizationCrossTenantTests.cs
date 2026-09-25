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
}
