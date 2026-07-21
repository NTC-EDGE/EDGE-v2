using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class RolePermissionDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Tenants.AnyAsync())
        {
            return;
        }

        var staticDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // ── Seed Tenant ────────────────────────────────────────────────────────
        var defaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var defaultTenant = new Tenant
        {
            Id = defaultTenantId,
            Name = "NTC Central Office",
            Slug = "ntc-central",
            Description = "National Telecommunications Commission Main Office",
            IsActive = true,
            CreatedAt = staticDate
        };
        await context.Tenants.AddAsync(defaultTenant);

        // ── Role IDs ─────────────────────────────────────────────────────────
        var superAdminRoleId  = Guid.Parse("10000000-0000-0000-0000-000000000000");
        var clientRoleId      = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var evaluatorRoleId   = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var higherUpsRoleId   = Guid.Parse("10000000-0000-0000-0000-000000000003");
        var accountantRoleId  = Guid.Parse("10000000-0000-0000-0000-000000000004");
        var cashierRoleId     = Guid.Parse("10000000-0000-0000-0000-000000000005");
        var adminRoleId       = Guid.Parse("10000000-0000-0000-0000-000000000006");

        // ── Seed Roles ────────────────────────────────────────────────────────
        var roles = new List<Role>
        {
            new() { Id = superAdminRoleId, TenantId = null,            IsSystemRole = true,  Name = "Super Administrator", Key = "superadmin", Description = "System-wide administrator", CreatedAt = staticDate },
            new() { Id = clientRoleId,     TenantId = defaultTenantId, IsSystemRole = false, Name = "Client",              Key = "client",     Description = "External portal user", CreatedAt = staticDate },
            new() { Id = evaluatorRoleId,  TenantId = defaultTenantId, IsSystemRole = false, Name = "Evaluator",           Key = "evaluator",  Description = "Staff member",         CreatedAt = staticDate },
            new() { Id = higherUpsRoleId,  TenantId = defaultTenantId, IsSystemRole = false, Name = "Higher-Ups",          Key = "higherups",  Description = "Executive approver",   CreatedAt = staticDate },
            new() { Id = accountantRoleId, TenantId = defaultTenantId, IsSystemRole = false, Name = "Accountant",          Key = "accountant", Description = "Financial admin",      CreatedAt = staticDate },
            new() { Id = cashierRoleId,    TenantId = defaultTenantId, IsSystemRole = false, Name = "Cashier",             Key = "cashier",    Description = "Payment admin",        CreatedAt = staticDate },
            new() { Id = adminRoleId,      TenantId = defaultTenantId, IsSystemRole = false, Name = "Administrator",       Key = "admin",      Description = "Tenant administrator", CreatedAt = staticDate },
        };
        await context.Roles.AddRangeAsync(roles);

        // ── Seed RolePermissions ──────────────────────────────────────────────
        int rpCounter = 1;
        Guid NextRpId() => Guid.Parse($"30000000-0000-0000-0000-{rpCounter++:D12}");

        var rolePermissions = new List<RolePermission>
        {
            // Client
            new() { Id = NextRpId(), RoleId = clientRoleId, PermissionKey = Permissions.SubmitApplication, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = clientRoleId, PermissionKey = Permissions.ViewOwnApplications, CreatedAt = staticDate },
            // Evaluator
            new() { Id = NextRpId(), RoleId = evaluatorRoleId, PermissionKey = Permissions.ViewAllApplications, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = evaluatorRoleId, PermissionKey = Permissions.EvaluateApplication, CreatedAt = staticDate },
            // Higher-Ups
            new() { Id = NextRpId(), RoleId = higherUpsRoleId, PermissionKey = Permissions.ViewAllApplications, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = higherUpsRoleId, PermissionKey = Permissions.ApproveApplication, CreatedAt = staticDate },
            // Accountant
            new() { Id = NextRpId(), RoleId = accountantRoleId, PermissionKey = Permissions.ViewAllApplications, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = accountantRoleId, PermissionKey = Permissions.CreateBilling, CreatedAt = staticDate },
            // Cashier
            new() { Id = NextRpId(), RoleId = cashierRoleId, PermissionKey = Permissions.ViewAllApplications, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = cashierRoleId, PermissionKey = Permissions.CollectPayment, CreatedAt = staticDate },
            // Admin (all permissions in tenant)
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.SubmitApplication, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.ViewOwnApplications, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.ViewAllApplications, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.EvaluateApplication, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.ApproveApplication, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.CreateBilling, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.CollectPayment, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.ManageUsers, CreatedAt = staticDate },
            new() { Id = NextRpId(), RoleId = adminRoleId, PermissionKey = Permissions.SystemAdmin, CreatedAt = staticDate },
        };
        await context.RolePermissions.AddRangeAsync(rolePermissions);

        // ── Seed Users ────────────────────────────────────────────────────────
        var userClient = new User { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), AuthUserId = "user_client123", Email = "client@ntcedge.com", FirstName = "John", LastName = "Client", IsSuperAdmin = false, CreatedAt = staticDate };
        var userEval   = new User { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), AuthUserId = "user_evaluator123", Email = "evaluator@ntcedge.com", FirstName = "Jane", LastName = "Evaluator", IsSuperAdmin = false, CreatedAt = staticDate };
        var userHigher = new User { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), AuthUserId = "user_higherups123", Email = "higherups@ntcedge.com", FirstName = "Chief", LastName = "Officer", IsSuperAdmin = false, CreatedAt = staticDate };
        var userAcct   = new User { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), AuthUserId = "user_accountant123", Email = "accountant@ntcedge.com", FirstName = "Alice", LastName = "Accountant", IsSuperAdmin = false, CreatedAt = staticDate };
        var userCash   = new User { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), AuthUserId = "user_cashier123", Email = "cashier@ntcedge.com", FirstName = "Bob", LastName = "Cashier", IsSuperAdmin = false, CreatedAt = staticDate };
        var userAdmin  = new User { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), AuthUserId = "user_admin123", Email = "admin@ntcedge.com", FirstName = "Super", LastName = "Admin", IsSuperAdmin = true, CreatedAt = staticDate };

        var users = new List<User> { userClient, userEval, userHigher, userAcct, userCash, userAdmin };
        await context.Users.AddRangeAsync(users);

        // ── Seed Tenant Memberships ───────────────────────────────────────────
        var tenantMembers = new List<TenantMember>
        {
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000001"), TenantId = defaultTenantId, UserId = userClient.Id, RoleId = clientRoleId, IsActive = true, JoinedAt = staticDate, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000002"), TenantId = defaultTenantId, UserId = userEval.Id,   RoleId = evaluatorRoleId, IsActive = true, JoinedAt = staticDate, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000003"), TenantId = defaultTenantId, UserId = userHigher.Id, RoleId = higherUpsRoleId, IsActive = true, JoinedAt = staticDate, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000004"), TenantId = defaultTenantId, UserId = userAcct.Id,   RoleId = accountantRoleId, IsActive = true, JoinedAt = staticDate, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000005"), TenantId = defaultTenantId, UserId = userCash.Id,   RoleId = cashierRoleId, IsActive = true, JoinedAt = staticDate, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000006"), TenantId = defaultTenantId, UserId = userAdmin.Id,  RoleId = adminRoleId, IsActive = true, JoinedAt = staticDate, CreatedAt = staticDate },
        };
        await context.TenantMembers.AddRangeAsync(tenantMembers);

        await context.SaveChangesAsync();
    }
}
