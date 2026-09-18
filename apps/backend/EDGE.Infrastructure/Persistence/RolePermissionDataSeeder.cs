using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using EDGE.Infrastructure.Services;

namespace EDGE.Infrastructure.Persistence;

public static class RolePermissionDataSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        bool forceResetPermissions = true,
        IClerkUserService? clerkUserService = null,
        ILogger? logger = null,
        bool throwOnPartialFailure = false)
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
        var superAdminRoleId       = Guid.Parse("10000000-0000-0000-0000-000000000000");
        var clientRoleId           = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var evaluatorRoleId        = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var chiefEodRoleId         = Guid.Parse("10000000-0000-0000-0000-000000000003");
        var accountantRoleId       = Guid.Parse("10000000-0000-0000-0000-000000000004");
        var cashierRoleId          = Guid.Parse("10000000-0000-0000-0000-000000000005");
        var adminRoleId            = Guid.Parse("10000000-0000-0000-0000-000000000006");
        var regionalDirectorRoleId = Guid.Parse("10000000-0000-0000-0000-000000000007");
        var legalRoleId            = Guid.Parse("10000000-0000-0000-0000-000000000008");

        var defaultRoles = new List<Role>
        {
            new() { Id = superAdminRoleId,       TenantId = null, IsSystemRole = true,  Name = "Super Administrator", Key = "superadmin",        Description = "System-wide administrator with full root access",     CreatedAt = staticDate },
            new() { Id = adminRoleId,            TenantId = null, IsSystemRole = false, Name = "Administrator",       Key = "admin",             Description = "Tenant / Regional administrator with full office access", CreatedAt = staticDate },
            new() { Id = regionalDirectorRoleId, TenantId = null, IsSystemRole = false, Name = "Regional Director",   Key = "regional_director", Description = "Regional executive authority and final approver",     CreatedAt = staticDate },
            new() { Id = chiefEodRoleId,         TenantId = null, IsSystemRole = false, Name = "Chief of EOD",        Key = "chief_of_eod",      Description = "Chief of Enforcement and Operations Division",        CreatedAt = staticDate },
            new() { Id = legalRoleId,            TenantId = null, IsSystemRole = false, Name = "Legal Officer",       Key = "legal",             Description = "Legal and compliance officer",                        CreatedAt = staticDate },
            new() { Id = accountantRoleId,       TenantId = null, IsSystemRole = false, Name = "Accountant",          Key = "accountant",        Description = "Financial and billing administrator",                 CreatedAt = staticDate },
            new() { Id = cashierRoleId,          TenantId = null, IsSystemRole = false, Name = "Cashier",             Key = "cashier",           Description = "Payment collection and receipt administrator",        CreatedAt = staticDate },
            new() { Id = evaluatorRoleId,        TenantId = null, IsSystemRole = false, Name = "Evaluator",           Key = "evaluator",         Description = "Staff reviewer and application evaluator",            CreatedAt = staticDate },
            new() { Id = clientRoleId,           TenantId = null, IsSystemRole = false, Name = "Client",              Key = "client",            Description = "External portal user and public applicant",           CreatedAt = staticDate },
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

        var actualSuperAdminRoleId       = roleKeyToIdMap.GetValueOrDefault("superadmin", superAdminRoleId);
        var actualClientRoleId           = roleKeyToIdMap.GetValueOrDefault("client", clientRoleId);
        var actualEvaluatorRoleId        = roleKeyToIdMap.GetValueOrDefault("evaluator", evaluatorRoleId);
        var actualChiefEodRoleId         = roleKeyToIdMap.GetValueOrDefault("chief_of_eod", roleKeyToIdMap.GetValueOrDefault("higherups", chiefEodRoleId));
        var actualRegionalDirectorRoleId = roleKeyToIdMap.GetValueOrDefault("regional_director", regionalDirectorRoleId);
        var actualLegalRoleId            = roleKeyToIdMap.GetValueOrDefault("legal", legalRoleId);
        var actualAccountantRoleId       = roleKeyToIdMap.GetValueOrDefault("accountant", accountantRoleId);
        var actualCashierRoleId          = roleKeyToIdMap.GetValueOrDefault("cashier", cashierRoleId);
        var actualAdminRoleId            = roleKeyToIdMap.GetValueOrDefault("admin", adminRoleId);

        var seedRoleIds = new List<Guid>
        {
            actualSuperAdminRoleId,
            actualClientRoleId,
            actualEvaluatorRoleId,
            actualChiefEodRoleId,
            actualRegionalDirectorRoleId,
            actualLegalRoleId,
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
            // Client (Public Applicant)
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
            (actualClientRoleId, Permissions.ReadSchedules),

            // Evaluator (Frontline Staff Evaluator)
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
            (actualEvaluatorRoleId, Permissions.ReadSchedules),

            // Chief of EOD (Enforcement & Operations Division Head)
            (actualChiefEodRoleId, Permissions.ReadTenants),
            (actualChiefEodRoleId, Permissions.ReadRoles),
            (actualChiefEodRoleId, Permissions.ViewAllApplications),
            (actualChiefEodRoleId, Permissions.ViewOwnApplications),
            (actualChiefEodRoleId, Permissions.ReadApplication),
            (actualChiefEodRoleId, Permissions.EvaluateApplication),
            (actualChiefEodRoleId, Permissions.ApproveApplication),
            (actualChiefEodRoleId, Permissions.ReadServices),
            (actualChiefEodRoleId, Permissions.ReadRequirements),
            (actualChiefEodRoleId, Permissions.ReadStorage),
            (actualChiefEodRoleId, Permissions.DownloadStorage),
            (actualChiefEodRoleId, Permissions.UploadStorage),
            (actualChiefEodRoleId, Permissions.ReadServiceNotes),
            (actualChiefEodRoleId, Permissions.ReadSoaNotes),
            (actualChiefEodRoleId, Permissions.ReadSchedules),

            // Regional Director (Regional Executive Authority & Approver)
            (actualRegionalDirectorRoleId, Permissions.ReadTenants),
            (actualRegionalDirectorRoleId, Permissions.ReadRoles),
            (actualRegionalDirectorRoleId, Permissions.ViewAllApplications),
            (actualRegionalDirectorRoleId, Permissions.ViewOwnApplications),
            (actualRegionalDirectorRoleId, Permissions.ReadApplication),
            (actualRegionalDirectorRoleId, Permissions.ApproveApplication),
            (actualRegionalDirectorRoleId, Permissions.ReadServices),
            (actualRegionalDirectorRoleId, Permissions.ReadRequirements),
            (actualRegionalDirectorRoleId, Permissions.ReadStorage),
            (actualRegionalDirectorRoleId, Permissions.DownloadStorage),
            (actualRegionalDirectorRoleId, Permissions.ReadServiceNotes),
            (actualRegionalDirectorRoleId, Permissions.ReadSoaNotes),
            (actualRegionalDirectorRoleId, Permissions.ReadSchedules),
            (actualRegionalDirectorRoleId, Permissions.PublishSchedules),
            (actualRegionalDirectorRoleId, Permissions.ReceiptsRead),
            (actualRegionalDirectorRoleId, Permissions.CashierReports),

            // Legal Officer (Compliance & Legal Reviews)
            (actualLegalRoleId, Permissions.ReadTenants),
            (actualLegalRoleId, Permissions.ReadRoles),
            (actualLegalRoleId, Permissions.ViewAllApplications),
            (actualLegalRoleId, Permissions.ViewOwnApplications),
            (actualLegalRoleId, Permissions.ReadApplication),
            (actualLegalRoleId, Permissions.ReadServices),
            (actualLegalRoleId, Permissions.ReadRequirements),
            (actualLegalRoleId, Permissions.ReadStorage),
            (actualLegalRoleId, Permissions.DownloadStorage),
            (actualLegalRoleId, Permissions.ReadServiceNotes),

            // Accountant (Billing & Financial Reviews)
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
            (actualAccountantRoleId, Permissions.ReadSoaNotes),
            (actualAccountantRoleId, Permissions.BankAccountsManage),
            (actualAccountantRoleId, Permissions.ReceiptsDeposit),
            (actualAccountantRoleId, Permissions.CashierReports),

            // Cashier (Payments & Official Receipts)
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
            (actualCashierRoleId, Permissions.ReceiptsRead),
            (actualCashierRoleId, Permissions.ReceiptsBundleEntry),
            (actualCashierRoleId, Permissions.ReceiptsIssue),
            (actualCashierRoleId, Permissions.ReceiptsEdit),
            (actualCashierRoleId, Permissions.ReceiptsCancel),
            (actualCashierRoleId, Permissions.ReceiptsDeposit),
            (actualCashierRoleId, Permissions.CashierReports),
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
            new() { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), AuthUserId = "user_chiefeod123", Email = "chiefeod@ntcedge.com", FirstName = "Engr. Roberto", LastName = "Chief (EOD)", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), AuthUserId = "user_accountant123", Email = "accountant@ntcedge.com", FirstName = "Alice", LastName = "Accountant", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), AuthUserId = "user_cashier123", Email = "cashier@ntcedge.com", FirstName = "Bob", LastName = "Cashier", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), AuthUserId = "user_superadmin123", Email = "superadmin@ntcedge.com", FirstName = "Super", LastName = "Administrator", IsSuperAdmin = true, CreatedAt = staticDate },
            new() { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), AuthUserId = "user_director123", Email = "director@ntcedge.com", FirstName = "Director", LastName = "Regional", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), AuthUserId = "user_legal123", Email = "legal@ntcedge.com", FirstName = "Atty. Clara", LastName = "Legal", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), AuthUserId = "user_admin123", Email = "admin@ntcedge.com", FirstName = "Regional", LastName = "Admin", IsSuperAdmin = false, CreatedAt = staticDate },
            new() { Id = Guid.Parse("33333333-3333-3333-3333-333333333334"), AuthUserId = "user_higherups123", Email = "higherups@ntcedge.com", FirstName = "Chief", LastName = "Officer (Legacy)", IsSuperAdmin = false, CreatedAt = staticDate },
        };

        foreach (var user in defaultUsers)
        {
            var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Id == user.Id || u.Email == user.Email);
            if (dbUser == null)
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
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000003"), TenantId = defaultTenantId, UserId = Guid.Parse("33333333-3333-3333-3333-333333333333"), RoleId = actualChiefEodRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000004"), TenantId = defaultTenantId, UserId = Guid.Parse("44444444-4444-4444-4444-444444444444"), RoleId = actualAccountantRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000005"), TenantId = defaultTenantId, UserId = Guid.Parse("55555555-5555-5555-5555-555555555555"), RoleId = actualCashierRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000006"), TenantId = defaultTenantId, UserId = Guid.Parse("66666666-6666-6666-6666-666666666666"), RoleId = actualSuperAdminRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000007"), TenantId = defaultTenantId, UserId = Guid.Parse("77777777-7777-7777-7777-777777777777"), RoleId = actualRegionalDirectorRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000008"), TenantId = defaultTenantId, UserId = Guid.Parse("88888888-8888-8888-8888-888888888888"), RoleId = actualLegalRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000009"), TenantId = defaultTenantId, UserId = Guid.Parse("99999999-9999-9999-9999-999999999999"), RoleId = actualAdminRoleId, CreatedAt = staticDate },
            new() { Id = Guid.Parse("40000000-0000-0000-0000-000000000034"), TenantId = defaultTenantId, UserId = Guid.Parse("33333333-3333-3333-3333-333333333334"), RoleId = actualChiefEodRoleId, CreatedAt = staticDate },
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

        // ── 6. Sync/Provision Default Seed Users to Clerk (if Clerk service available) ──
        if (clerkUserService != null)
        {
            logger?.LogInformation("Syncing seed users to Clerk authentication service...");
            var syncResults = new List<(string Email, bool Success, string? Error)>();

            foreach (var user in defaultUsers)
            {
                var succeeded = false;
                string? lastError = null;

                for (var attempt = 1; attempt <= 3; attempt++)
                {
                    try
                    {
                        var existingClerkUsers = await clerkUserService.GetUsersByEmailAsync(user.Email);
                        if (existingClerkUsers != null && existingClerkUsers.Count > 0)
                        {
                            var clerkUser = existingClerkUsers[0];
                            var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
                            if (dbUser != null && dbUser.AuthUserId != clerkUser.Id)
                            {
                                dbUser.AuthUserId = clerkUser.Id;
                                await context.SaveChangesAsync();
                                logger?.LogInformation("Linked seed user '{Email}' to existing Clerk ID: {ClerkId}", user.Email, clerkUser.Id);
                            }
                        }
                        else
                        {
                            var payload = new CreateClerkUserPayload
                            {
                                EmailAddress = user.Email,
                                Password = "Password123!",
                                FirstName = user.FirstName,
                                LastName = user.LastName,
                                Username = ClerkUserService.GenerateSafeFallbackUsername(user.FirstName, user.LastName, user.Email),
                                PublicMetadata = new Dictionary<string, object>
                                {
                                    { "is_super_admin", user.IsSuperAdmin },
                                    { "seeded", true }
                                }
                            };

                            var created = await clerkUserService.CreateUserAsync(payload);
                            var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
                            if (dbUser != null && created != null)
                            {
                                dbUser.AuthUserId = created.Id;
                                await context.SaveChangesAsync();
                                logger?.LogInformation("Successfully provisioned seed user '{Email}' in Clerk with ID: {ClerkId}", user.Email, created.Id);
                            }
                        }

                        succeeded = true;
                        break;
                    }
                    catch (Exception ex)
                    {
                        lastError = ex.Message;
                        if (attempt < 3)
                        {
                            await Task.Delay(300 * attempt);
                        }
                    }
                }

                if (succeeded)
                {
                    syncResults.Add((user.Email, true, null));
                }
                else
                {
                    syncResults.Add((user.Email, false, lastError));
                    logger?.LogWarning("Clerk sync for seed user '{Email}' skipped after retries: {Error}", user.Email, lastError);
                }
            }

            var failedSyncs = syncResults.Where(r => !r.Success).ToList();
            if (failedSyncs.Count > 0)
            {
                var failedEmails = string.Join(", ", failedSyncs.Select(f => $"{f.Email} ({f.Error})"));
                logger?.LogError("Seed synchronization finished with {FailedCount}/{TotalCount} failures. Affected accounts: {FailedEmails}",
                    failedSyncs.Count, syncResults.Count, failedEmails);

                if (throwOnPartialFailure)
                {
                    throw new InvalidOperationException(
                        $"Clerk seed synchronization failed for {failedSyncs.Count} user account(s): {failedEmails}");
                }
            }
            else
            {
                logger?.LogInformation("Clerk synchronization successfully verified/provisioned all {Count} seed users.", syncResults.Count);
            }
        }
    }
}
