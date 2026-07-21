using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        await Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (Database.CurrentTransaction != null)
        {
            await Database.CurrentTransaction.CommitAsync(cancellationToken);
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (Database.CurrentTransaction != null)
        {
            await Database.CurrentTransaction.RollbackAsync(cancellationToken);
        }
    }

    public DbSet<EDGE.Domain.Entities.Application> Applications => Set<EDGE.Domain.Entities.Application>();
    public DbSet<ApplicationService> ApplicationServices => Set<ApplicationService>();
    public DbSet<ApplicationApplicant> ApplicationApplicants => Set<ApplicationApplicant>();
    public DbSet<ApplicationRequirement> ApplicationRequirements => Set<ApplicationRequirement>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<Municipality> Municipalities => Set<Municipality>();
    public DbSet<Barangay> Barangays => Set<Barangay>();
    public DbSet<CompanyDetail> CompanyDetails => Set<CompanyDetail>();
    public DbSet<ApplicantDetail> ApplicantDetails => Set<ApplicantDetail>();
    public DbSet<Applicant> Applicants => Set<Applicant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("public");

        // Application enum string conversions
        modelBuilder.Entity<EDGE.Domain.Entities.Application>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.SubmissionMode).HasConversion<string>();
            entity.Property(e => e.DataEntryMethod).HasConversion<string>();
        });

        // Geographic configurations
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

        modelBuilder.Entity<CompanyDetail>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.RegistrationNumber).HasMaxLength(50);
            entity.Property(e => e.EntityType).HasConversion<string>();
            entity.HasOne(d => d.Barangay)
                  .WithMany()
                  .HasForeignKey(d => d.BarangayId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicantDetail>(entity =>
        {
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.HasOne(d => d.Barangay)
                  .WithMany()
                  .HasForeignKey(d => d.BarangayId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.CompanyDetail)
                  .WithMany()
                  .HasForeignKey(d => d.CompanyDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Applicant>(entity =>
        {
            entity.Property(e => e.ApplicantType).HasConversion<string>();
            entity.HasOne(d => d.ApplicantDetail)
                  .WithMany()
                  .HasForeignKey(d => d.ApplicantDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}

