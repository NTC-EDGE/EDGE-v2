using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantMember> TenantMembers => Set<TenantMember>();
    public DbSet<ApplicationRecord> Applications => Set<ApplicationRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<Municipality> Municipalities => Set<Municipality>();
    public DbSet<Barangay> Barangays => Set<Barangay>();
    public DbSet<Schedule> Schedules => Set<Schedule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("public");

        // Force string conversion for ApplicationStatus enum in DB
        modelBuilder.Entity<ApplicationRecord>()
            .Property(e => e.Status)
            .HasConversion<string>();

        // Tenant Configuration
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(50);
        });

        // Role Configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasOne(r => r.Tenant)
                  .WithMany(t => t.Roles)
                  .HasForeignKey(r => r.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // RolePermission Configuration
        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasIndex(rp => new { rp.RoleId, rp.PermissionKey }).IsUnique();
            entity.HasOne(rp => rp.Role)
                  .WithMany(r => r.RolePermissions)
                  .HasForeignKey(rp => rp.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // TenantMember Configuration
        modelBuilder.Entity<TenantMember>(entity =>
        {
            entity.HasIndex(tm => new { tm.TenantId, tm.UserId }).IsUnique();

            entity.HasOne(tm => tm.Tenant)
                  .WithMany(t => t.Members)
                  .HasForeignKey(tm => tm.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tm => tm.User)
                  .WithMany(u => u.TenantMemberships)
                  .HasForeignKey(tm => tm.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tm => tm.Role)
                  .WithMany(r => r.Members)
                  .HasForeignKey(tm => tm.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Geographic entity configurations
        modelBuilder.Entity<Region>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<Province>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(d => d.Region)
                  .WithMany(p => p.Provinces)
                  .HasForeignKey(d => d.RegionId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Municipality>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(d => d.Province)
                  .WithMany(p => p.Municipalities)
                  .HasForeignKey(d => d.ProvinceId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Barangay>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(d => d.Municipality)
                  .WithMany(p => p.Barangays)
                  .HasForeignKey(d => d.MunicipalityId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Schedule Configuration
        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.Property(e => e.Venue).IsRequired().HasMaxLength(200);
            entity.Property(e => e.SeatNumber).HasMaxLength(50);
            entity.Property(e => e.Remarks).HasMaxLength(500);

            // Prepared relationship mappings (uncomment once Tenant, Service, & ApplicationRecord entities are ready):
            // entity.HasOne(s => s.Tenant).WithMany(t => t.Schedules).HasForeignKey(s => s.TenantId).OnDelete(DeleteBehavior.Cascade);
            // entity.HasOne(s => s.Application).WithMany(a => a.Schedules).HasForeignKey(s => s.ApplicationId).OnDelete(DeleteBehavior.SetNull);
            // entity.HasOne(s => s.Service).WithMany(sv => sv.Schedules).HasForeignKey(s => s.ServiceId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
