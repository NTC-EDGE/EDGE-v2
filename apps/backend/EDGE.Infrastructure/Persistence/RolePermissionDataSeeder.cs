using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace EDGE.Infrastructure.Persistence;

public static class RolePermissionDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, bool forceResetPermissions = true)
    {
        var staticDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

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
            try
            {
                await context.Tenants.AddAsync(defaultTenant);
                await context.SaveChangesAsync();
            }
            catch (Exception ex) when (ex is DbUpdateException || ex.InnerException is PostgresException)
            {
                context.Entry(defaultTenant).State = EntityState.Detached;
            }
        }

        // ── 2. Seed Roles (Idempotent per role with duplicate key catch) ──────────
        var superAdminRoleId  = Guid.Parse("10000000-0000-0000-0000-000000000000");
        var clientRoleId      = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var evaluatorRoleId   = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var higherUpsRoleId   = Guid.Parse("10000000-0000-0000-0000-000000000003");
        var accountantRoleId  = Guid.Parse("10000000-0000-0000-0000-000000000004");
        var cashierRoleId     = Guid.Parse("10000000-0000-0000-0000-000000000005");
        var adminRoleId       = Guid.Parse("10000000-0000-0000-0000-000000000006");

        var defaultRoles = new List<Role>
        {
            new() { Id = superAdminRoleId, TenantId = null, IsSystemRole = true,  Name = "Super Administrator", Key = "superadmin", Description = "System-wide administrator", CreatedAt = staticDate },
            new() { Id = clientRoleId,     TenantId = null, IsSystemRole = false, Name = "Client",              Key = "client",     Description = "External portal user", CreatedAt = staticDate },
            new() { Id = evaluatorRoleId,  TenantId = null, IsSystemRole = false, Name = "Evaluator",           Key = "evaluator",  Description = "Staff member",         CreatedAt = staticDate },
            new() { Id = higherUpsRoleId,  TenantId = null, IsSystemRole = false, Name = "Higher-Ups",          Key = "higherups",  Description = "Executive approver",   CreatedAt = staticDate },
            new() { Id = accountantRoleId, TenantId = null, IsSystemRole = false, Name = "Accountant",          Key = "accountant", Description = "Financial admin",      CreatedAt = staticDate },
            new() { Id = cashierRoleId,    TenantId = null, IsSystemRole = false, Name = "Cashier",             Key = "cashier",    Description = "Payment admin",        CreatedAt = staticDate },
            new() { Id = adminRoleId,      TenantId = null, IsSystemRole = false, Name = "Administrator",       Key = "admin",      Description = "Tenant administrator", CreatedAt = staticDate },
        };

        foreach (var role in defaultRoles)
        {
            var existingRole = await context.Roles.FirstOrDefaultAsync(r => r.Id == role.Id || r.Key == role.Key);
            if (existingRole == null)
            {
                try
                {
                    await context.Roles.AddAsync(role);
                    await context.SaveChangesAsync();
                }
                catch (Exception ex) when (ex is DbUpdateException || ex.InnerException is PostgresException)
                {
                    context.Entry(role).State = EntityState.Detached;
                }
            }
            else if (existingRole.TenantId != null && defaultRoles.Any(d => d.Key == existingRole.Key))
            {
                existingRole.TenantId = null;
                await context.SaveChangesAsync();
            }
        }

        // Fetch actual role mappings from database
        var dbRoles = await context.Roles.AsNoTracking().ToListAsync();
        var roleKeyToIdMap = dbRoles.ToDictionary(r => r.Key.ToLowerInvariant(), r => r.Id);

        var actualSuperAdminRoleId  = roleKeyToIdMap.GetValueOrDefault("superadmin", superAdminRoleId);
        var actualClientRoleId      = roleKeyToIdMap.GetValueOrDefault("client", clientRoleId);
        var actualEvaluatorRoleId   = roleKeyToIdMap.GetValueOrDefault("evaluator", evaluatorRoleId);
        var actualHigherUpsRoleId   = roleKeyToIdMap.GetValueOrDefault("higherups", higherUpsRoleId);
        var actualAccountantRoleId  = roleKeyToIdMap.GetValueOrDefault("accountant", accountantRoleId);
        var actualCashierRoleId     = roleKeyToIdMap.GetValueOrDefault("cashier", cashierRoleId);
        var actualAdminRoleId       = roleKeyToIdMap.GetValueOrDefault("admin", adminRoleId);

        var seedRoleIds = new List<Guid>
        {
            actualSuperAdminRoleId,
            actualClientRoleId,
            actualEvaluatorRoleId,
            actualHigherUpsRoleId,
            actualAccountantRoleId,
            actualCashierRoleId,
            actualAdminRoleId
        };

        if (forceResetPermissions)
        {
            var validKeys = Permissions.AllKeys.ToList();
            var invalidOrSeededRolePermissions = await context.RolePermissions
                .Where(rp => seedRoleIds.Contains(rp.RoleId) || !validKeys.Contains(rp.PermissionKey))
                .ToListAsync();

            if (invalidOrSeededRolePermissions.Count > 0)
            {
                context.RolePermissions.RemoveRange(invalidOrSeededRolePermissions);
                await context.SaveChangesAsync();
            }
        }

        // ── 3. Seed RolePermissions ───────────────────────────────────────────────
        var targetRolePermissions = new List<(Guid RoleId, string PermissionKey)>
        {
            // Client
            (actualClientRoleId, Permissions.ReadTenants),
            (actualClientRoleId, Permissions.ReadRoles),
            (actualClientRoleId, Permissions.SubmitApplication),
            (actualClientRoleId, Permissions.ViewOwnApplications),
            (actualClientRoleId, Permissions.ReadApplication),
            (actualClientRoleId, Permissions.ReadServices),
            (actualClientRoleId, Permissions.ReadRequirements),
            (actualClientRoleId, Permissions.UploadStorage),
            (actualClientRoleId, Permissions.ReadStorage),
            (actualClientRoleId, Permissions.DownloadStorage),

            // Evaluator
            (actualEvaluatorRoleId, Permissions.ReadTenants),
            (actualEvaluatorRoleId, Permissions.ReadRoles),
            (actualEvaluatorRoleId, Permissions.ViewAllApplications),
            (actualEvaluatorRoleId, Permissions.ViewOwnApplications),
            (actualEvaluatorRoleId, Permissions.ReadApplication),
            (actualEvaluatorRoleId, Permissions.UpdateApplication),
            (actualEvaluatorRoleId, Permissions.EvaluateApplication),
            (actualEvaluatorRoleId, Permissions.ReadServices),
            (actualEvaluatorRoleId, Permissions.ReadRequirements),
            (actualEvaluatorRoleId, Permissions.ReadStorage),
            (actualEvaluatorRoleId, Permissions.DownloadStorage),
            (actualEvaluatorRoleId, Permissions.UploadStorage),
            (actualEvaluatorRoleId, Permissions.ReadServiceNotes),
            (actualEvaluatorRoleId, Permissions.CreateServiceNotes),
            (actualEvaluatorRoleId, Permissions.UpdateServiceNotes),
            (actualEvaluatorRoleId, Permissions.ReadSoaNotes),
            (actualEvaluatorRoleId, Permissions.CreateSoaNotes),
            (actualEvaluatorRoleId, Permissions.UpdateSoaNotes),

            // Higher-Ups
            (actualHigherUpsRoleId, Permissions.ReadTenants),
            (actualHigherUpsRoleId, Permissions.ReadRoles),
            (actualHigherUpsRoleId, Permissions.ViewAllApplications),
            (actualHigherUpsRoleId, Permissions.ViewOwnApplications),
            (actualHigherUpsRoleId, Permissions.ReadApplication),
            (actualHigherUpsRoleId, Permissions.ApproveApplication),
            (actualHigherUpsRoleId, Permissions.ReadServices),
            (actualHigherUpsRoleId, Permissions.ReadRequirements),
            (actualHigherUpsRoleId, Permissions.ReadStorage),
            (actualHigherUpsRoleId, Permissions.DownloadStorage),
            (actualHigherUpsRoleId, Permissions.ReadServiceNotes),
            (actualHigherUpsRoleId, Permissions.ReadSoaNotes),

            // Accountant
            (actualAccountantRoleId, Permissions.ReadTenants),
            (actualAccountantRoleId, Permissions.ReadRoles),
            (actualAccountantRoleId, Permissions.ViewAllApplications),
            (actualAccountantRoleId, Permissions.ViewOwnApplications),
            (actualAccountantRoleId, Permissions.ReadApplication),
            (actualAccountantRoleId, Permissions.CreateBilling),
            (actualAccountantRoleId, Permissions.ApproveSoa),
            (actualAccountantRoleId, Permissions.ReturnSoa),
            (actualAccountantRoleId, Permissions.ReadServices),
            (actualAccountantRoleId, Permissions.ReadRequirements),
            (actualAccountantRoleId, Permissions.ReadStorage),
            (actualAccountantRoleId, Permissions.DownloadStorage),

            // Cashier
            (actualCashierRoleId, Permissions.ReadTenants),
            (actualCashierRoleId, Permissions.ReadRoles),
            (actualCashierRoleId, Permissions.ViewAllApplications),
            (actualCashierRoleId, Permissions.ViewOwnApplications),
            (actualCashierRoleId, Permissions.ReadApplication),
            (actualCashierRoleId, Permissions.CollectPayment),
            (actualCashierRoleId, Permissions.ReturnOp),
            (actualCashierRoleId, Permissions.ReadServices),
            (actualCashierRoleId, Permissions.ReadRequirements),
            (actualCashierRoleId, Permissions.ReadStorage),
            (actualCashierRoleId, Permissions.DownloadStorage),
        };

        // Add all permissions to SuperAdmin and Admin roles dynamically
        foreach (var permKey in Permissions.AllKeys)
        {
            targetRolePermissions.Add((actualSuperAdminRoleId, permKey));
            targetRolePermissions.Add((actualAdminRoleId, permKey));
        }

        var uniqueTargetRolePermissions = targetRolePermissions.Distinct().ToList();

        var existingInDb = await context.RolePermissions
            .IgnoreQueryFilters()
            .ToListAsync();
        var existingMap = existingInDb.ToDictionary(rp => (rp.RoleId, rp.PermissionKey));

        foreach (var (roleId, permKey) in uniqueTargetRolePermissions)
        {
            if (existingMap.TryGetValue((roleId, permKey), out var existingRp))
            {
                if (existingRp.IsDeleted)
                {
                    existingRp.IsDeleted = false;
                    existingRp.IsDeletedBy = string.Empty;
                    existingRp.LastModifiedAt = staticDate;
                }
            }
            else
            {
                var rpEntity = new RolePermission
                {
                    Id = Guid.NewGuid(),
                    RoleId = roleId,
                    PermissionKey = permKey,
                    CreatedAt = staticDate
                };
                context.RolePermissions.Add(rpEntity);
            }
        }
        await context.SaveChangesAsync();

        // ── 4. Seed Users ─────────────────────────────────────────────────────────
        var defaultUsers = new List<User>
        {
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), AuthUserId = "user_client123", Email = "client@ntcedge.com", FirstName = "John", LastName = "Client", AccountType = ApplicantType.Individual, IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-222222222222"), AuthUserId = "user_liaison123", Email = "rdizon@apexconsulting.ph", FirstName = "Engr. Ricardo", LastName = "Dizon (Liaison Representative)", AccountType = ApplicantType.Company, IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), AuthUserId = "user_evaluator123", Email = "evaluator@ntcedge.com", FirstName = "Jane", LastName = "Evaluator", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), AuthUserId = "user_higherups123", Email = "higherups@ntcedge.com", FirstName = "Chief", LastName = "Officer", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), AuthUserId = "user_accountant123", Email = "accountant@ntcedge.com", FirstName = "Alice", LastName = "Accountant", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), AuthUserId = "user_cashier123", Email = "cashier@ntcedge.com", FirstName = "Bob", LastName = "Cashier", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), AuthUserId = "user_admin123", Email = "admin@ntcedge.com", FirstName = "Super", LastName = "Admin", IsSuperAdmin = true, CreatedAt = staticDate },
        };

        foreach (var user in defaultUsers)
        {
            var exists = await context.Users.AnyAsync(u => u.Id == user.Id || u.Email == user.Email);
            if (!exists)
            {
                try
                {
                    await context.Users.AddAsync(user);
                    await context.SaveChangesAsync();
                }
                catch (Exception ex) when (ex is DbUpdateException || ex.InnerException is PostgresException)
                {
                    context.Entry(user).State = EntityState.Detached;
                }
            }
        }

        // ── 5. Seed Tenant Memberships ────────────────────────────────────────────
        var defaultTenantMembers = new List<TenantMember>
        {
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000001"), TenantId = defaultTenantId, UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"), RoleId = actualClientRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000002"), TenantId = defaultTenantId, UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"), RoleId = actualEvaluatorRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000003"), TenantId = defaultTenantId, UserId = Guid.Parse("33333333-3333-3333-3333-333333333333"), RoleId = actualHigherUpsRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000004"), TenantId = defaultTenantId, UserId = Guid.Parse("44444444-4444-4444-4444-444444444444"), RoleId = actualAccountantRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000005"), TenantId = defaultTenantId, UserId = Guid.Parse("55555555-5555-5555-5555-555555555555"), RoleId = actualCashierRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000006"), TenantId = defaultTenantId, UserId = Guid.Parse("66666666-6666-6666-6666-666666666666"), RoleId = actualAdminRoleId, CreatedAt = staticDate },
        };

        foreach (var member in defaultTenantMembers)
        {
            var exists = await context.TenantMembers.AnyAsync(m => m.Id == member.Id || (m.TenantId == member.TenantId && m.UserId == member.UserId));
            if (!exists)
            {
                try
                {
                    await context.TenantMembers.AddAsync(member);
                    await context.SaveChangesAsync();
                }
                catch (Exception ex) when (ex is DbUpdateException || ex.InnerException is PostgresException)
                {
                    context.Entry(member).State = EntityState.Detached;
                }
            }
        }
    }
}
