using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Common;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

    public DbSet<ApplicationRecord> Applications => Set<ApplicationRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantMember> TenantMembers => Set<TenantMember>();

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
