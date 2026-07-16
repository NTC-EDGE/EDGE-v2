using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

    public DbSet<ApplicationRecord> Applications => Set<ApplicationRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("public");

        // Force string conversion for ApplicationStatus enum in DB
        modelBuilder.Entity<ApplicationRecord>()
            .Property(e => e.Status)
            .HasConversion<string>();
    }
}
