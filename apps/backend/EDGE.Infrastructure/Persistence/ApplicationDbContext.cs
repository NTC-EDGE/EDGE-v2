#define STEP_001
#define STEP_002
#define STEP_003
#define STEP_004
#define STEP_005
#define STEP_006
#define STEP_007
#define STEP_008
#define STEP_009
#define STEP_010
#define STEP_011
#define STEP_012
#define STEP_013
#define STEP_014
#define STEP_015
#define STEP_016
#define STEP_017
#define STEP_018
#define STEP_019
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Common;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

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

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantMember> TenantMembers => Set<TenantMember>();
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

    public DbSet<Fee> Fees => Set<Fee>();
    public DbSet<ServiceFee> ServiceFees => Set<ServiceFee>();

#if STEP_001
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
#endif
#if STEP_002
    public DbSet<Service> Services => Set<Service>();
#endif
#if STEP_003
    public DbSet<ServiceVariant> ServiceVariants => Set<ServiceVariant>();
    public DbSet<Requirement> Requirements => Set<Requirement>();
    public DbSet<ServiceVariantRequirement> ServiceVariantRequirements => Set<ServiceVariantRequirement>();
#endif

#if STEP_005
    public DbSet<ExaminationSchedule> ExaminationSchedules => Set<ExaminationSchedule>();
#endif
#if STEP_006
    public DbSet<Form> Forms => Set<Form>();
#endif
#if STEP_007
    public DbSet<FormSection> FormSections => Set<FormSection>();
#endif
#if STEP_008
    public DbSet<Field> Fields => Set<Field>();
#endif
#if STEP_009
    public DbSet<SectionField> SectionFields => Set<SectionField>();
#endif
#if STEP_010
    public DbSet<ApplicantDetail> ApplicantDetails => Set<ApplicantDetail>();
#endif
#if STEP_011
    public DbSet<CompanyDetail> CompanyDetails => Set<CompanyDetail>();
#endif
#if STEP_012
    public DbSet<Applicant> Applicants => Set<Applicant>();
#endif
#if STEP_013
    public DbSet<EDGE.Domain.Entities.Application> Applications => Set<EDGE.Domain.Entities.Application>();
#endif
#if STEP_014
    public DbSet<ApplicationService> ApplicationServices => Set<ApplicationService>();
#endif
#if STEP_015
    public DbSet<ApplicationApplicant> ApplicationApplicants => Set<ApplicationApplicant>();
#endif
#if STEP_016
    public DbSet<FormSubmission> FormSubmissions => Set<FormSubmission>();
#endif
#if STEP_017
    public DbSet<FormFieldValue> FormFieldValues => Set<FormFieldValue>();
#endif
#if STEP_018
    public DbSet<ApplicationRequirement> ApplicationRequirements => Set<ApplicationRequirement>();
#endif
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();
#if STEP_019
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
#endif


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

        // Tenant Configuration
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
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

            entity.HasIndex(e => new { e.TenantId, e.UserId }).IsUnique();
        });

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
            entity.HasIndex(e => new { e.TenantId, e.Code }).IsUnique();
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.OfficerInCharge)
                  .WithMany()
                  .HasForeignKey(e => e.OfficerInChargeId)
                  .OnDelete(DeleteBehavior.Restrict);
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

            entity.HasOne(e => e.Service)
                  .WithMany(s => s.Schedules)
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

#if STEP_001
        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasIndex(e => e.Code).IsUnique();
        });
#endif

#if STEP_002
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasOne(e => e.ServiceCategory)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceCategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
#endif

#if STEP_003
        modelBuilder.Entity<ServiceVariant>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasOne(e => e.Service)
                  .WithMany(s => s.ServiceVariants)
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
#endif


#if STEP_005
        modelBuilder.Entity<ExaminationSchedule>(entity =>
        {
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
#endif

#if STEP_006
        modelBuilder.Entity<Form>(entity =>
        {
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
#endif

#if STEP_007
        modelBuilder.Entity<FormSection>(entity =>
        {
            entity.HasIndex(e => new { e.FormId, e.Key }).IsUnique();
            entity.HasOne(e => e.Form)
                  .WithMany(f => f.Sections)
                  .HasForeignKey(e => e.FormId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
#endif

#if STEP_008
        modelBuilder.Entity<Field>(entity =>
        {
            entity.Property(e => e.FieldType).IsRequired();
        });
#endif

#if STEP_009
        modelBuilder.Entity<SectionField>(entity =>
        {
            entity.HasKey(e => new { e.FormSectionId, e.FieldId });
            entity.HasOne(e => e.FormSection)
                  .WithMany(s => s.SectionFields)
                  .HasForeignKey(e => e.FormSectionId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Field)
                  .WithMany()
                  .HasForeignKey(e => e.FieldId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
#endif

#if STEP_010
        modelBuilder.Entity<ApplicantDetail>(entity =>
        {
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.HasOne(d => d.Barangay)
                  .WithMany()
                  .HasForeignKey(d => d.BarangayId)
                  .OnDelete(DeleteBehavior.Restrict);
#if STEP_011
            entity.HasOne(d => d.CompanyDetail)
                  .WithMany()
                  .HasForeignKey(d => d.CompanyDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
#endif
        });
#endif

#if STEP_011
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
#endif

#if STEP_012
        modelBuilder.Entity<Applicant>(entity =>
        {
            entity.Property(e => e.ApplicantType).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
#if STEP_010
            entity.HasOne(d => d.ApplicantDetail)
                  .WithMany()
                  .HasForeignKey(d => d.ApplicantDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
#endif
#if STEP_011
            entity.HasOne(d => d.CompanyDetail)
                  .WithMany()
                  .HasForeignKey(d => d.CompanyDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
#endif
            entity.HasOne(d => d.Tenant)
                  .WithMany()
                  .HasForeignKey(d => d.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.User)
                  .WithMany()
                  .HasForeignKey(d => d.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
#endif

#if STEP_013
        modelBuilder.Entity<EDGE.Domain.Entities.Application>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.SubmissionMode).HasConversion<string>();
            entity.Property(e => e.DataEntryMethod).HasConversion<string>();
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Region)
                  .WithMany()
                  .HasForeignKey(e => e.RegionId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Schedule)
                  .WithMany()
                  .HasForeignKey(e => e.ScheduleId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
#endif

#if STEP_014
        modelBuilder.Entity<ApplicationService>(entity =>
        {
            entity.HasOne(e => e.Application)
                  .WithMany(a => a.ApplicationServices)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
#if STEP_002
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
#endif
#if STEP_003
            entity.HasOne(e => e.ServiceVariant)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Restrict);
#endif
        });
#endif

#if STEP_015
        modelBuilder.Entity<ApplicationApplicant>(entity =>
        {
            entity.HasKey(e => new { e.ApplicationId, e.ApplicantId });
#if STEP_013
            entity.HasOne(e => e.Application)
                  .WithMany(a => a.ApplicationApplicants)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
#endif
#if STEP_012
            entity.HasOne(e => e.Applicant)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.Cascade);
#endif
        });
#endif

#if STEP_016
        modelBuilder.Entity<FormSubmission>(entity =>
        {
#if STEP_013
            entity.HasOne(e => e.Application)
                  .WithMany(a => a.FormSubmissions)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
#endif
#if STEP_006
            entity.HasOne(e => e.Form)
                  .WithMany()
                  .HasForeignKey(e => e.FormId)
                  .OnDelete(DeleteBehavior.Restrict);
#endif
#if STEP_012
            entity.HasOne(e => e.Applicant)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.Restrict);
#endif
        });
#endif

#if STEP_017
        modelBuilder.Entity<FormFieldValue>(entity =>
        {
            entity.HasKey(e => new { e.FormSubmissionId, e.FieldId });
#if STEP_016
            entity.HasOne(e => e.FormSubmission)
                  .WithMany(s => s.FieldValues)
                  .HasForeignKey(e => e.FormSubmissionId)
                  .OnDelete(DeleteBehavior.Cascade);
#endif
#if STEP_008
            entity.HasOne(e => e.Field)
                  .WithMany()
                  .HasForeignKey(e => e.FieldId)
                  .OnDelete(DeleteBehavior.Restrict);
#endif
        });
#endif

#if STEP_018
        modelBuilder.Entity<ApplicationRequirement>(entity =>
        {
#if STEP_013
            entity.HasOne(e => e.Application)
                  .WithMany(a => a.ApplicationRequirements)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
#endif
#if STEP_012
            entity.HasOne(e => e.Applicant)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.Cascade);
#endif
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
#endif

#if STEP_019
        modelBuilder.Entity<ApplicationStatusHistory>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();
#if STEP_013
            entity.HasOne(e => e.Application)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
#endif
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Fee entity configuration
        modelBuilder.Entity<Fee>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // ServiceFee entity configuration
        modelBuilder.Entity<ServiceFee>(entity =>
        {
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.HasOne(d => d.Fee)
                  .WithMany(p => p.ServiceFees)
                  .HasForeignKey(d => d.FeeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Service)
                  .WithMany(p => p.ServiceFees)
                  .HasForeignKey(d => d.ServiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
#endif

        modelBuilder.Entity<StoredFile>(entity =>
        {
            entity.HasIndex(e => e.StorageKey).IsUnique();
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.Category);
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Requirement entity configuration
        modelBuilder.Entity<Requirement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // ServiceVariantRequirement entity configuration
        modelBuilder.Entity<ServiceVariantRequirement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ContextKey);


            entity.HasOne(e => e.Requirement)
                  .WithMany(r => r.ServiceVariantRequirements)
                  .HasForeignKey(e => e.RequirementId)
                  .OnDelete(DeleteBehavior.Restrict);


            entity.HasOne(e => e.ServiceVariant)
                  .WithMany(sv => sv.ServiceVariantRequirements)
                  .HasForeignKey(e => e.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);
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
