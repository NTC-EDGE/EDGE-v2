using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

    public DbSet<ApplicationRecord> Applications => Set<ApplicationRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("public");

        // Force string conversion for ApplicationStatus enum in DB
        modelBuilder.Entity<ApplicationRecord>()
            .Property(e => e.Status)
            .HasConversion<string>();

        // Mappings
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(rp => rp.RoleId);

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(rp => rp.PermissionId);

        // Guids for seeding
        var clientRoleId = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var evaluatorRoleId = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var higherUpsRoleId = Guid.Parse("10000000-0000-0000-0000-000000000003");
        var accountantRoleId = Guid.Parse("10000000-0000-0000-0000-000000000004");
        var cashierRoleId = Guid.Parse("10000000-0000-0000-0000-000000000005");
        var adminRoleId = Guid.Parse("10000000-0000-0000-0000-000000000006");

        var permSubmitId = Guid.Parse("20000000-0000-0000-0000-000000000001");
        var permViewOwnId = Guid.Parse("20000000-0000-0000-0000-000000000002");
        var permViewAllId = Guid.Parse("20000000-0000-0000-0000-000000000003");
        var permEvaluateId = Guid.Parse("20000000-0000-0000-0000-000000000004");
        var permApproveId = Guid.Parse("20000000-0000-0000-0000-000000000005");
        var permCreateBillingId = Guid.Parse("20000000-0000-0000-0000-000000000006");
        var permCollectPaymentId = Guid.Parse("20000000-0000-0000-0000-000000000007");
        var permManageUsersId = Guid.Parse("20000000-0000-0000-0000-000000000008");
        var permSystemAdminId = Guid.Parse("20000000-0000-0000-0000-000000000009");

        // Seed Roles
        var staticDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = clientRoleId, Name = "Client", Key = "client", Description = "External portal user requesting services", CreatedAt = staticDate },
            new Role { Id = evaluatorRoleId, Name = "Evaluator", Key = "evaluator", Description = "Staff member performing assessments", CreatedAt = staticDate },
            new Role { Id = higherUpsRoleId, Name = "Higher-Ups", Key = "higherups", Description = "Executive approver of applications", CreatedAt = staticDate },
            new Role { Id = accountantRoleId, Name = "Accountant", Key = "accountant", Description = "Billing and financial administrator", CreatedAt = staticDate },
            new Role { Id = cashierRoleId, Name = "Cashier", Key = "cashier", Description = "Payment processing administrator", CreatedAt = staticDate },
            new Role { Id = adminRoleId, Name = "Administrator", Key = "admin", Description = "System administrator with full access", CreatedAt = staticDate }
        );

        // Seed Permissions
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = permSubmitId, Name = "Submit Application", Key = EDGE.Domain.Authorization.Permissions.SubmitApplication, Description = "Can submit new applications", CreatedAt = staticDate },
            new Permission { Id = permViewOwnId, Name = "View Own Applications", Key = EDGE.Domain.Authorization.Permissions.ViewOwnApplications, Description = "Can view personal applications", CreatedAt = staticDate },
            new Permission { Id = permViewAllId, Name = "View All Applications", Key = EDGE.Domain.Authorization.Permissions.ViewAllApplications, Description = "Can view all applications in system", CreatedAt = staticDate },
            new Permission { Id = permEvaluateId, Name = "Evaluate Application", Key = EDGE.Domain.Authorization.Permissions.EvaluateApplication, Description = "Can run evaluation checks", CreatedAt = staticDate },
            new Permission { Id = permApproveId, Name = "Approve Application", Key = EDGE.Domain.Authorization.Permissions.ApproveApplication, Description = "Can approve or reject applications", CreatedAt = staticDate },
            new Permission { Id = permCreateBillingId, Name = "Create Billing", Key = EDGE.Domain.Authorization.Permissions.CreateBilling, Description = "Can create bills and invoices", CreatedAt = staticDate },
            new Permission { Id = permCollectPaymentId, Name = "Collect Payment", Key = EDGE.Domain.Authorization.Permissions.CollectPayment, Description = "Can process payments and print receipts", CreatedAt = staticDate },
            new Permission { Id = permManageUsersId, Name = "Manage Users", Key = EDGE.Domain.Authorization.Permissions.ManageUsers, Description = "Can update user roles and configurations", CreatedAt = staticDate },
            new Permission { Id = permSystemAdminId, Name = "System Admin Access", Key = EDGE.Domain.Authorization.Permissions.SystemAdmin, Description = "Full system administration capability", CreatedAt = staticDate }
        );

        // Seed RolePermissions
        int rpCounter = 1;
        Guid getRpGuid() => Guid.Parse($"30000000-0000-0000-0000-{rpCounter++:D12}");

        modelBuilder.Entity<RolePermission>().HasData(
            // Client
            new RolePermission { Id = getRpGuid(), RoleId = clientRoleId, PermissionId = permSubmitId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = clientRoleId, PermissionId = permViewOwnId, CreatedAt = staticDate },
            // Evaluator
            new RolePermission { Id = getRpGuid(), RoleId = evaluatorRoleId, PermissionId = permViewAllId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = evaluatorRoleId, PermissionId = permEvaluateId, CreatedAt = staticDate },
            // HigherUps
            new RolePermission { Id = getRpGuid(), RoleId = higherUpsRoleId, PermissionId = permViewAllId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = higherUpsRoleId, PermissionId = permApproveId, CreatedAt = staticDate },
            // Accountant
            new RolePermission { Id = getRpGuid(), RoleId = accountantRoleId, PermissionId = permViewAllId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = accountantRoleId, PermissionId = permCreateBillingId, CreatedAt = staticDate },
            // Cashier
            new RolePermission { Id = getRpGuid(), RoleId = cashierRoleId, PermissionId = permViewAllId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = cashierRoleId, PermissionId = permCollectPaymentId, CreatedAt = staticDate },
            // Admin (All)
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permSubmitId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permViewOwnId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permViewAllId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permEvaluateId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permApproveId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permCreateBillingId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permCollectPaymentId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permManageUsersId, CreatedAt = staticDate },
            new RolePermission { Id = getRpGuid(), RoleId = adminRoleId, PermissionId = permSystemAdminId, CreatedAt = staticDate }
        );

        // Seed users matching standard Clerk dev identifiers for manual verification/fallback testing
        modelBuilder.Entity<User>().HasData(
            new User { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), AuthUserId = "user_client123", Email = "client@ntcedge.com", FirstName = "John", LastName = "Client", RoleId = clientRoleId, CreatedAt = staticDate },
            new User { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), AuthUserId = "user_evaluator123", Email = "evaluator@ntcedge.com", FirstName = "Jane", LastName = "Evaluator", RoleId = evaluatorRoleId, CreatedAt = staticDate },
            new User { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), AuthUserId = "user_higherups123", Email = "higherups@ntcedge.com", FirstName = "Chief", LastName = "Officer", RoleId = higherUpsRoleId, CreatedAt = staticDate },
            new User { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), AuthUserId = "user_accountant123", Email = "accountant@ntcedge.com", FirstName = "Alice", LastName = "Accountant", RoleId = accountantRoleId, CreatedAt = staticDate },
            new User { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), AuthUserId = "user_cashier123", Email = "cashier@ntcedge.com", FirstName = "Bob", LastName = "Cashier", RoleId = cashierRoleId, CreatedAt = staticDate },
            new User { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), AuthUserId = "user_admin123", Email = "admin@ntcedge.com", FirstName = "Super", LastName = "Admin", RoleId = adminRoleId, CreatedAt = staticDate }
        );
    }
}
