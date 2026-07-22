using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Common;
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
    public DbSet<FieldOffice> FieldOffices => Set<FieldOffice>();
    public DbSet<Note> Notes => Set<Note>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("public");

        // Global query filter for soft delete
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(ConvertFilterExpression(entityType.ClrType));
            }
        }

        // Force string conversion for ApplicationStatus enum in DB
        modelBuilder.Entity<ApplicationRecord>()
            .Property(e => e.Status)
            .HasConversion<string>();

        // Role Configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasOne(r => r.Tenant)
                  .WithMany()
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

        modelBuilder.Entity<FieldOffice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasOne(e => e.Region)
                  .WithMany(r => r.FieldOffices)
                  .HasForeignKey(e => e.RegionId)
                  .OnDelete(DeleteBehavior.Cascade);
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
            entity.Property(e => e.IsPublished).HasDefaultValue(false);
            entity.Property(e => e.MaximumSlots).IsRequired(false);

            // Prepared relationship mappings (uncomment once Tenant, Service, & ApplicationRecord entities are ready):
            // entity.HasOne(s => s.Tenant).WithMany(t => t.Schedules).HasForeignKey(s => s.TenantId).OnDelete(DeleteBehavior.Cascade);
            // entity.HasOne(s => s.Application).WithMany(a => a.Schedules).HasForeignKey(s => s.ApplicationId).OnDelete(DeleteBehavior.SetNull);
            // entity.HasOne(s => s.Service).WithMany(sv => sv.Schedules).HasForeignKey(s => s.ServiceId).OnDelete(DeleteBehavior.Restrict);
        });

        // Tenant Configuration
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.RegionId).IsRequired();
        });

        // TenantMember Configuration
        modelBuilder.Entity<TenantMember>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RoleId).IsRequired();
            entity.Property(e => e.JobTitle).HasMaxLength(100);
            entity.Property(e => e.Level).HasMaxLength(100);
            entity.Property(e => e.Division).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Position).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Designation).HasMaxLength(100);

            entity.HasOne(e => e.Tenant)
                  .WithMany(t => t.Members)
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.TenantMemberships)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Role)
                  .WithMany(r => r.Members)
                  .HasForeignKey(e => e.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FieldOffice)
                  .WithMany(fo => fo.AssignedMembers)
                  .HasForeignKey(e => e.FieldOfficeId)
                  .OnDelete(DeleteBehavior.SetNull);

            // Unique constraint to prevent registering the same user to the same tenant twice
            entity.HasIndex(e => new { e.TenantId, e.UserId }).IsUnique();
        });
    }

    private static System.Linq.Expressions.LambdaExpression ConvertFilterExpression(Type type)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(AuditableEntity.IsDeleted));
        var falseConstant = System.Linq.Expressions.Expression.Constant(false);
        var equal = System.Linq.Expressions.Expression.Equal(property, falseConstant);
        return System.Linq.Expressions.Expression.Lambda(equal, parameter);
    }
}
