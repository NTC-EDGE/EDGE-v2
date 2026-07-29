using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class RolePermissionDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var staticDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        bool changesMade = false;

        // ── 1. Seed Default Tenant ────────────────────────────────────────────────
        var defaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        if (!await context.Tenants.AnyAsync(t => t.Id == defaultTenantId))
        {
            var defaultTenant = new Tenant
            {
                Id = defaultTenantId,
                Name = "NTC Central Office",
                Code = "NTC-CENTRAL",
                Description = "National Telecommunications Commission Main Office",
                IsActive = true,
                RegionId = Guid.Parse("1e66819d-583c-4852-83bd-a4195bd126a8"),
                CreatedAt = staticDate
            };
            await context.Tenants.AddAsync(defaultTenant);
            changesMade = true;
        }

        // ── 2. Seed Roles ─────────────────────────────────────────────────────────
        var superAdminRoleId  = Guid.Parse("10000000-0000-0000-0000-000000000000");
        var clientRoleId      = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var evaluatorRoleId   = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var higherUpsRoleId   = Guid.Parse("10000000-0000-0000-0000-000000000003");
        var accountantRoleId  = Guid.Parse("10000000-0000-0000-0000-000000000004");
        var cashierRoleId     = Guid.Parse("10000000-0000-0000-0000-000000000005");
        var adminRoleId       = Guid.Parse("10000000-0000-0000-0000-000000000006");

        var defaultRoles = new List<Role>
        {
            new() { Id = superAdminRoleId, TenantId = null,            IsSystemRole = true,  Name = "Super Administrator", Key = "superadmin", Description = "System-wide administrator", CreatedAt = staticDate },
            new() { Id = clientRoleId,     TenantId = defaultTenantId, IsSystemRole = false, Name = "Client",              Key = "client",     Description = "External portal user", CreatedAt = staticDate },
            new() { Id = evaluatorRoleId,  TenantId = defaultTenantId, IsSystemRole = false, Name = "Evaluator",           Key = "evaluator",  Description = "Staff member",         CreatedAt = staticDate },
            new() { Id = higherUpsRoleId,  TenantId = defaultTenantId, IsSystemRole = false, Name = "Higher-Ups",          Key = "higherups",  Description = "Executive approver",   CreatedAt = staticDate },
            new() { Id = accountantRoleId, TenantId = defaultTenantId, IsSystemRole = false, Name = "Accountant",          Key = "accountant", Description = "Financial admin",      CreatedAt = staticDate },
            new() { Id = cashierRoleId,    TenantId = defaultTenantId, IsSystemRole = false, Name = "Cashier",             Key = "cashier",    Description = "Payment admin",        CreatedAt = staticDate },
            new() { Id = adminRoleId,      TenantId = defaultTenantId, IsSystemRole = false, Name = "Administrator",       Key = "admin",      Description = "Tenant administrator", CreatedAt = staticDate },
        };

        var existingRoleIds = await context.Roles.Select(r => r.Id).ToListAsync();
        foreach (var role in defaultRoles)
        {
            if (!existingRoleIds.Contains(role.Id))
            {
                await context.Roles.AddAsync(role);
                changesMade = true;
            }
        }

        if (changesMade)
        {
            await context.SaveChangesAsync();
            changesMade = false;
        }

        // ── 3. Seed RolePermissions (Idempotent by (RoleId, PermissionKey)) ─────
        var targetRolePermissions = new List<(Guid RoleId, string PermissionKey)>
        {
            // Client
            (clientRoleId, Permissions.SubmitApplication),
            (clientRoleId, Permissions.ViewOwnApplications),
            (clientRoleId, Permissions.ReadServices),
            (clientRoleId, Permissions.ReadRequirements),
            (clientRoleId, Permissions.UploadStorage),
            (clientRoleId, Permissions.ReadStorage),
            (clientRoleId, Permissions.DownloadStorage),
            (clientRoleId, Permissions.ReadTenants),

            // Evaluator
            (evaluatorRoleId, Permissions.ViewAllApplications),
            (evaluatorRoleId, Permissions.EvaluateApplication),
            (evaluatorRoleId, Permissions.ReadServices),
            (evaluatorRoleId, Permissions.ReadRequirements),
            (evaluatorRoleId, Permissions.ReadStorage),
            (evaluatorRoleId, Permissions.DownloadStorage),


            // Higher-Ups
            (higherUpsRoleId, Permissions.ViewAllApplications),
            (higherUpsRoleId, Permissions.ApproveApplication),
            (higherUpsRoleId, Permissions.ReadServices),
            (higherUpsRoleId, Permissions.ReadRequirements),

            // Accountant
            (accountantRoleId, Permissions.ViewAllApplications),
            (accountantRoleId, Permissions.CreateBilling),
            (accountantRoleId, Permissions.ReadServices),

            // Cashier
            (cashierRoleId, Permissions.ViewAllApplications),
            (cashierRoleId, Permissions.CollectPayment),
            (cashierRoleId, Permissions.ReadServices),

        };

        // Add all permissions to SuperAdmin and Admin roles dynamically
        foreach (var permKey in Permissions.AllKeys)
        {
            targetRolePermissions.Add((superAdminRoleId, permKey));
            targetRolePermissions.Add((adminRoleId, permKey));
        }


        var existingRpPairs = await context.RolePermissions
            .Select(rp => new { rp.RoleId, rp.PermissionKey })
            .ToListAsync();

        var existingRpSet = new HashSet<(Guid RoleId, string PermissionKey)>(
            existingRpPairs.Select(rp => (rp.RoleId, rp.PermissionKey)));

        foreach (var (roleId, permKey) in targetRolePermissions)
        {
            if (!existingRpSet.Contains((roleId, permKey)))
            {
                await context.RolePermissions.AddAsync(new RolePermission
                {
                    Id = Guid.NewGuid(),
                    RoleId = roleId,
                    PermissionKey = permKey,
                    CreatedAt = staticDate
                });
                changesMade = true;
            }
        }

        // ── 4. Seed Users ─────────────────────────────────────────────────────────
        var defaultUsers = new List<User>
        {
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), AuthUserId = "user_client123", Email = "client@ntcedge.com", FirstName = "John", LastName = "Client", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), AuthUserId = "user_evaluator123", Email = "evaluator@ntcedge.com", FirstName = "Jane", LastName = "Evaluator", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), AuthUserId = "user_higherups123", Email = "higherups@ntcedge.com", FirstName = "Chief", LastName = "Officer", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), AuthUserId = "user_accountant123", Email = "accountant@ntcedge.com", FirstName = "Alice", LastName = "Accountant", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), AuthUserId = "user_cashier123", Email = "cashier@ntcedge.com", FirstName = "Bob", LastName = "Cashier", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), AuthUserId = "user_admin123", Email = "admin@ntcedge.com", FirstName = "Super", LastName = "Admin", IsSuperAdmin = true, CreatedAt = staticDate },
        };

        var existingUserIds = await context.Users.Select(u => u.Id).ToListAsync();
        foreach (var user in defaultUsers)
        {
            if (!existingUserIds.Contains(user.Id))
            {
                await context.Users.AddAsync(user);
                changesMade = true;
            }
        }

        if (changesMade)
        {
            await context.SaveChangesAsync();
            changesMade = false;
        }

        // ── 5. Seed Tenant Memberships ────────────────────────────────────────────
        var defaultTenantMembers = new List<TenantMember>
        {
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000001"), TenantId = defaultTenantId, UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"), RoleId = clientRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000002"), TenantId = defaultTenantId, UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"), RoleId = evaluatorRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000003"), TenantId = defaultTenantId, UserId = Guid.Parse("33333333-3333-3333-3333-333333333333"), RoleId = higherUpsRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000004"), TenantId = defaultTenantId, UserId = Guid.Parse("44444444-4444-4444-4444-444444444444"), RoleId = accountantRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000005"), TenantId = defaultTenantId, UserId = Guid.Parse("55555555-5555-5555-5555-555555555555"), RoleId = cashierRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000006"), TenantId = defaultTenantId, UserId = Guid.Parse("66666666-6666-6666-6666-666666666666"), RoleId = adminRoleId, CreatedAt = staticDate },
        };

        var existingMemberIds = await context.TenantMembers.Select(m => m.Id).ToListAsync();
        foreach (var member in defaultTenantMembers)
        {
            if (!existingMemberIds.Contains(member.Id))
            {
                await context.TenantMembers.AddAsync(member);
                changesMade = true;
            }
        }

        if (changesMade)
        {
            await context.SaveChangesAsync();
        }
    }
}
