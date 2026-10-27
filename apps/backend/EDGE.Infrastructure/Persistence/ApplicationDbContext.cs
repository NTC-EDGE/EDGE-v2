using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
        configurationBuilder.Properties<Enum>().HaveConversion<string>();
    }

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
    public DbSet<ServiceNote> ServiceNotes => Set<ServiceNote>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<SystemAnnouncement> SystemAnnouncements => Set<SystemAnnouncement>();

    public DbSet<Fee> Fees => Set<Fee>();
    public DbSet<SystemConfig> SystemConfigs => Set<SystemConfig>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    public DbSet<SystemErrorLog> SystemErrorLogs => Set<SystemErrorLog>();
    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<ServiceFee> ServiceFees => Set<ServiceFee>();
    public DbSet<ServiceVariantFee> ServiceVariantFees => Set<ServiceVariantFee>();
    public DbSet<ServiceVariantElementFee> ServiceVariantElementFees => Set<ServiceVariantElementFee>();
    public DbSet<ServiceFormula> ServiceFormulas => Set<ServiceFormula>();
    public DbSet<ServiceVariantFormula> ServiceVariantFormulas => Set<ServiceVariantFormula>();
    public DbSet<ServiceVariantElementFormula> ServiceVariantElementFormulas => Set<ServiceVariantElementFormula>();
    public DbSet<Element> Elements => Set<Element>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceVariant> ServiceVariants => Set<ServiceVariant>();
    public DbSet<ServiceVariantElement> ServiceVariantElements => Set<ServiceVariantElement>();
    public DbSet<Requirement> Requirements => Set<Requirement>();
    public DbSet<ServiceVariantRequirement> ServiceVariantRequirements => Set<ServiceVariantRequirement>();
    public DbSet<ExaminationSchedule> ExaminationSchedules => Set<ExaminationSchedule>();
    public DbSet<Form> Forms => Set<Form>();
    public DbSet<FormSection> FormSections => Set<FormSection>();
    public DbSet<Field> Fields => Set<Field>();
    public DbSet<SectionField> SectionFields => Set<SectionField>();
    public DbSet<ApplicantDetail> ApplicantDetails => Set<ApplicantDetail>();
    public DbSet<CompanyDetail> CompanyDetails => Set<CompanyDetail>();
    public DbSet<Applicant> Applicants => Set<Applicant>();
    public DbSet<EDGE.Domain.Entities.Application> Applications => Set<EDGE.Domain.Entities.Application>();
    public DbSet<ApplicationApplicant> ApplicationApplicants => Set<ApplicationApplicant>();
    public DbSet<FormSubmission> FormSubmissions => Set<FormSubmission>();
    public DbSet<FormFieldValue> FormFieldValues => Set<FormFieldValue>();
    public DbSet<ApplicationRequirement> ApplicationRequirements => Set<ApplicationRequirement>();
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<ServiceInformation> ServiceInformations => Set<ServiceInformation>();

    public DbSet<StatementOfAccount> StatementsOfAccount => Set<StatementOfAccount>();
    public DbSet<SoaLineItem> SoaLineItems => Set<SoaLineItem>();
    public DbSet<SoaNote> SoaNotes => Set<SoaNote>();
    public DbSet<OrderOfPayment> OrdersOfPayment => Set<OrderOfPayment>();
    public DbSet<ApplicationHistory> ApplicationHistories => Set<ApplicationHistory>();
    public DbSet<SoaHistory> SoaHistories => Set<SoaHistory>();
    public DbSet<OpHistory> OpHistories => Set<OpHistory>();
    public DbSet<CorrectionAuditTrail> CorrectionAuditTrails => Set<CorrectionAuditTrail>();
    public DbSet<IssuedDocumentDetail> IssuedDocumentDetails => Set<IssuedDocumentDetail>();

    public DbSet<OrBooklet> OrBooklets => Set<OrBooklet>();
    public DbSet<OrBookletCashier> OrBookletCashiers => Set<OrBookletCashier>();
    public DbSet<OfficialReceipt> OfficialReceipts => Set<OfficialReceipt>();
    public DbSet<OfficialReceiptLineItem> OfficialReceiptLineItems => Set<OfficialReceiptLineItem>();
    public DbSet<AgencyBankAccount> AgencyBankAccounts => Set<AgencyBankAccount>();
    public DbSet<BankDeposit> BankDeposits => Set<BankDeposit>();

    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<MessageAttachment> MessageAttachments => Set<MessageAttachment>();
    public DbSet<MessageReadReceipt> MessageReadReceipts => Set<MessageReadReceipt>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingParticipant> MeetingParticipants => Set<MeetingParticipant>();
    public DbSet<MeetingAction> MeetingActions => Set<MeetingAction>();
    public DbSet<MeetingPoll> MeetingPolls => Set<MeetingPoll>();
    public DbSet<MeetingPollVote> MeetingPollVotes => Set<MeetingPollVote>();
    public DbSet<UserNotification> UserNotifications => Set<UserNotification>();

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
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
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
            entity.HasIndex(e => new { e.TenantId, e.RoleId });
            entity.HasIndex(e => new { e.TenantId, e.FieldOfficeId });
        });

        // Role Configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(r => new { r.TenantId, r.Key });
            entity.HasIndex(r => new { r.TenantId, r.Name });
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
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Category)
                  .HasConversion<string>()
                  .IsRequired()
                  .HasMaxLength(50)
                  .HasDefaultValue(FieldOfficeCategory.Main);
            entity.HasIndex(e => new { e.TenantId, e.Code }).IsUnique();
            entity.HasIndex(e => new { e.TenantId, e.Name });
            entity.HasIndex(e => new { e.TenantId, e.RegionId });
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
            entity.Property(e => e.Remarks).HasMaxLength(500);
            entity.Property(e => e.IsPublished).HasDefaultValue(false);
            entity.Property(e => e.MaximumSlots).IsRequired(false);

            entity.HasOne(e => e.Service)
                  .WithMany(s => s.Schedules)
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasIndex(e => e.Code).IsUnique();
        });

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

        modelBuilder.Entity<ServiceVariant>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasOne(e => e.Service)
                  .WithMany(s => s.ServiceVariants)
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ServiceVariantElement>(entity =>
        {
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.ServiceVariant)
                  .WithMany(sv => sv.ServiceVariantElements)
                  .HasForeignKey(e => e.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ExaminationSchedule>(entity =>
        {
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Form>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(250);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FormSection>(entity =>
        {
            entity.HasIndex(e => new { e.FormId, e.Key }).IsUnique();
            entity.HasOne(e => e.Form)
                  .WithMany(f => f.Sections)
                  .HasForeignKey(e => e.FormId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Field>(entity =>
        {
            entity.Property(e => e.FieldType).IsRequired();
        });

        modelBuilder.Entity<SectionField>(entity =>
        {
            entity.HasKey(e => new { e.FormSectionId, e.FieldId });
            entity.Property(e => e.VisibilityCondition).HasColumnType("text").IsRequired(false);
            entity.HasOne(e => e.FormSection)
                  .WithMany(s => s.SectionFields)
                  .HasForeignKey(e => e.FormSectionId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Field)
                  .WithMany()
                  .HasForeignKey(e => e.FieldId)
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

        modelBuilder.Entity<CompanyDetail>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(500);
            entity.Property(e => e.RegistrationNumber).HasMaxLength(50);
            entity.Property(e => e.EntityType).HasConversion<string>();
            entity.HasOne(d => d.Barangay)
                  .WithMany()
                  .HasForeignKey(d => d.BarangayId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.AuthUserId).HasMaxLength(256);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.AuthUserId);
            entity.Property(e => e.AccountType).HasConversion<string>();
            entity.HasOne(u => u.CompanyDetail)
                  .WithMany()
                  .HasForeignKey(u => u.CompanyDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Applicant>(entity =>
        {
            entity.Property(e => e.ApplicantType).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ServiceId);
            entity.HasIndex(e => e.ServiceVariantId);
            entity.HasIndex(e => e.ApplicantDetailId);
            entity.HasIndex(e => e.CompanyDetailId);
            entity.HasOne(d => d.ApplicantDetail)
                  .WithMany()
                  .HasForeignKey(d => d.ApplicantDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(d => d.CompanyDetail)
                  .WithMany()
                  .HasForeignKey(d => d.CompanyDetailId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(d => d.Tenant)
                  .WithMany()
                  .HasForeignKey(d => d.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.User)
                  .WithMany()
                  .HasForeignKey(d => d.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EDGE.Domain.Entities.Application>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.SubmissionMode).HasConversion<string>();
            entity.Property(e => e.DataEntryMethod).HasConversion<string>();
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.RegionId);
            entity.HasIndex(e => e.ScheduleId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ReferenceNumber);
            entity.HasIndex(e => new { e.TenantId, e.CreatedAt });
            entity.HasIndex(e => new { e.TenantId, e.Status });
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

        modelBuilder.Entity<Applicant>(entity =>
        {
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.ServiceVariant)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicationApplicant>(entity =>
        {
            entity.HasKey(e => new { e.ApplicationId, e.ApplicantId });
            entity.HasOne(e => e.Application)
                  .WithMany(a => a.ApplicationApplicants)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Applicant)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FormSubmission>(entity =>
        {
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.FormId);
            entity.HasOne(e => e.Application)
                  .WithMany(a => a.FormSubmissions)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Form)
                  .WithMany()
                  .HasForeignKey(e => e.FormId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Applicant)
                  .WithOne(a => a.FormSubmission)
                  .HasForeignKey<FormSubmission>(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FormFieldValue>(entity =>
        {
            entity.HasKey(e => new { e.FormSubmissionId, e.FieldId });
            entity.HasIndex(e => e.FieldId);
            entity.HasOne(e => e.FormSubmission)
                  .WithMany(s => s.FieldValues)
                  .HasForeignKey(e => e.FormSubmissionId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Field)
                  .WithMany()
                  .HasForeignKey(e => e.FieldId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicationRequirement>(entity =>
        {
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.ApplicantId);
            entity.HasIndex(e => e.StoredFileId);
            entity.HasIndex(e => e.TenantId);
            entity.HasOne(e => e.Application)
                  .WithMany(a => a.ApplicationRequirements)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Applicant)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ApplicationStatusHistory>(entity =>
        {
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Application)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ServiceNote entity configuration
        modelBuilder.Entity<ServiceNote>(entity =>
        {
            entity.HasOne(e => e.Service)
                  .WithMany(s => s.ServiceNotes)
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ServiceVariant)
                  .WithMany(sv => sv.ServiceNotes)
                  .HasForeignKey(e => e.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Fee entity configuration
        modelBuilder.Entity<Fee>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
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

            entity.HasOne(e => e.ServiceVariant)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ServiceVariantElement)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceVariantElementId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Element entity configuration
        modelBuilder.Entity<Element>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // ServiceVariantFee entity configuration
        modelBuilder.Entity<ServiceVariantFee>(entity =>
        {
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.HasOne(d => d.Fee)
                  .WithMany()
                  .HasForeignKey(d => d.FeeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.ServiceVariant)
                  .WithMany()
                  .HasForeignKey(d => d.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ServiceVariantElementFee entity configuration
        modelBuilder.Entity<ServiceVariantElementFee>(entity =>
        {
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.HasOne(d => d.Fee)
                  .WithMany()
                  .HasForeignKey(d => d.FeeId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.ServiceVariant)
                  .WithMany()
                  .HasForeignKey(d => d.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Element)
                  .WithMany()
                  .HasForeignKey(d => d.ElementId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ServiceFormula entity configuration
        modelBuilder.Entity<ServiceFormula>(entity =>
        {
            entity.Property(e => e.FormulaExpression).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasOne(d => d.Service)
                  .WithMany()
                  .HasForeignKey(d => d.ServiceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ServiceVariantFormula entity configuration
        modelBuilder.Entity<ServiceVariantFormula>(entity =>
        {
            entity.Property(e => e.FormulaExpression).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasOne(d => d.ServiceVariant)
                  .WithMany()
                  .HasForeignKey(d => d.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ServiceVariantElementFormula entity configuration
        modelBuilder.Entity<ServiceVariantElementFormula>(entity =>
        {
            entity.Property(e => e.FormulaExpression).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasOne(d => d.ServiceVariant)
                  .WithMany()
                  .HasForeignKey(d => d.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Element)
                  .WithMany()
                  .HasForeignKey(d => d.ElementId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

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
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasColumnType("text");
        });

        // ServiceVariantRequirement entity configuration
        modelBuilder.Entity<ServiceVariantRequirement>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Requirement)
                  .WithMany(r => r.ServiceVariantRequirements)
                  .HasForeignKey(e => e.RequirementId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ServiceVariant)
                  .WithMany(sv => sv.ServiceVariantRequirements)
                  .HasForeignKey(e => e.ServiceVariantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Domain Composite Entities configuration
        modelBuilder.Entity<StatementOfAccount>(entity =>
        {
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.IssuedToType).HasConversion<string>();
            entity.HasIndex(e => new { e.ApplicationId, e.CreatedAt });

            entity.HasOne(e => e.SoaNote)
                  .WithMany(n => n.StatementsOfAccount)
                  .HasForeignKey(e => e.SoaNoteId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SoaLineItem>(entity =>
        {
            entity.Property(e => e.FeeRate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<SoaNote>(entity =>
        {
            entity.Property(e => e.Notes).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Code).HasMaxLength(50);
            entity.HasIndex(e => e.TenantId);
            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderOfPayment>(entity =>
        {
            entity.Property(e => e.AmountDue).HasColumnType("decimal(18,2)");
            entity.Property(e => e.AmountReceived).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.PaymentMethod).HasConversion<string>();
            entity.HasIndex(e => new { e.ApplicationId, e.CreatedAt });
            entity.HasIndex(e => new { e.StatementOfAccountId, e.CreatedAt });
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.TenantId, e.CreatedAt });
        });

        modelBuilder.Entity<ApplicationHistory>(entity =>
        {
            entity.Property(e => e.FromStatus).HasConversion<string>();
            entity.Property(e => e.ToStatus).HasConversion<string>();
            entity.Property(e => e.PerformedByUserId).IsRequired(false);
        });

        modelBuilder.Entity<SoaHistory>(entity =>
        {
            entity.Property(e => e.FromStatus).HasConversion<string>();
            entity.Property(e => e.ToStatus).HasConversion<string>();
            entity.Property(e => e.PerformedByUserId).IsRequired(false);
        });

        modelBuilder.Entity<OpHistory>(entity =>
        {
            entity.Property(e => e.FromStatus).HasConversion<string>();
            entity.Property(e => e.ToStatus).HasConversion<string>();
            entity.Property(e => e.PerformedByUserId).IsRequired(false);
        });

        modelBuilder.Entity<IssuedDocumentDetail>(entity =>
        {
            entity.Property(e => e.FormNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LicenseNumber).HasMaxLength(100);
            entity.Property(e => e.CallSign).HasMaxLength(50);
            entity.Property(e => e.DocumentType).HasMaxLength(50);
            entity.Property(e => e.IssuedByStaffName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.OriginalEvaluatorName).HasMaxLength(200);
            entity.Property(e => e.OfficialReceiptNumber).HasMaxLength(100);
            entity.Property(e => e.QrVerificationCode).HasMaxLength(200);

            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.FormNumber);
            entity.HasIndex(e => e.LicenseNumber);
            entity.HasIndex(e => e.CallSign);

            entity.HasOne(e => e.Application)
                  .WithMany(a => a.IssuedDocumentDetails)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Applicant)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Receipt Management & Cashiering Configurations
        modelBuilder.Entity<OrBooklet>(entity =>
        {
            entity.Property(e => e.BookletNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Prefix).HasMaxLength(20);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasIndex(e => new { e.TenantId, e.BookletNumber });
            entity.HasIndex(e => new { e.TenantId, e.Status });

            entity.HasOne(e => e.AssignedUser)
                  .WithMany()
                  .HasForeignKey(e => e.AssignedUserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OrBookletCashier>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.BookletId, e.CashierUserId }).IsUnique();
            entity.HasIndex(e => e.CashierUserId);

            entity.HasOne(e => e.Booklet)
                  .WithMany(b => b.AssignedCashiers)
                  .HasForeignKey(e => e.BookletId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CashierUser)
                  .WithMany()
                  .HasForeignKey(e => e.CashierUserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OfficialReceipt>(entity =>
        {
            entity.Property(e => e.OfficialReceiptNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PayorName).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.PaymentMethod).HasConversion<string>();
            entity.HasIndex(e => new { e.TenantId, e.OfficialReceiptNumber });
            entity.HasIndex(e => new { e.TenantId, e.Status, e.IssuedAt });

            entity.HasOne(e => e.Booklet)
                  .WithMany(b => b.Receipts)
                  .HasForeignKey(e => e.BookletId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.OrderOfPayment)
                  .WithMany()
                  .HasForeignKey(e => e.OrderOfPaymentId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Deposit)
                  .WithMany(d => d.Receipts)
                  .HasForeignKey(e => e.DepositId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.IssuedByUser)
                  .WithMany()
                  .HasForeignKey(e => e.IssuedByUserId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.CancelledByUser)
                  .WithMany()
                  .HasForeignKey(e => e.CancelledByUserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OfficialReceiptLineItem>(entity =>
        {
            entity.Property(e => e.FeeCode).HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.OfficialReceipt)
                  .WithMany(r => r.LineItems)
                  .HasForeignKey(e => e.OfficialReceiptId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AgencyBankAccount>(entity =>
        {
            entity.Property(e => e.BankName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.AccountName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.AccountNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Branch).HasMaxLength(200);
            entity.Property(e => e.FundCluster).HasMaxLength(100);
            entity.HasIndex(e => new { e.TenantId, e.AccountNumber });
        });

        modelBuilder.Entity<BankDeposit>(entity =>
        {
            entity.Property(e => e.DepositSlipNumber).IsRequired().HasMaxLength(100);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CashAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CheckAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasIndex(e => new { e.TenantId, e.DepositDate });

            entity.HasOne(e => e.BankAccount)
                  .WithMany(b => b.Deposits)
                  .HasForeignKey(e => e.BankAccountId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DepositedByUser)
                  .WithMany()
                  .HasForeignKey(e => e.DepositedByUserId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.VerifiedByUser)
                  .WithMany()
                  .HasForeignKey(e => e.VerifiedByUserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Communication Configurations
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.Scope).HasConversion<string>();
            entity.HasIndex(e => e.TenantId);
        });

        modelBuilder.Entity<ConversationParticipant>(entity =>
        {
            entity.Property(e => e.Role).HasConversion<string>();
            entity.HasIndex(e => new { e.ConversationId, e.UserId });
            entity.HasIndex(e => new { e.UserId, e.HasLeft, e.IsDeleted });
            entity.HasIndex(e => e.LastReadAt);
            entity.HasIndex(e => e.TenantId);
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.Property(e => e.Type).HasConversion<string>();
            entity.HasIndex(e => new { e.ConversationId, e.CreatedAt });
            entity.HasIndex(e => e.SenderId);
        });

        modelBuilder.Entity<Meeting>(entity =>
        {
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.MeetingCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Scope).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasIndex(e => e.MeetingCode).IsUnique();
            entity.HasIndex(e => new { e.HostUserId, e.ScheduledStartTime, e.IsDeleted });
            entity.HasIndex(e => e.TenantId);

            entity.HasOne(e => e.HostUser)
                  .WithMany()
                  .HasForeignKey(e => e.HostUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MeetingParticipant>(entity =>
        {
            entity.Property(e => e.Role).HasConversion<string>();
            entity.HasIndex(e => new { e.MeetingId, e.UserId });
            entity.HasIndex(e => new { e.UserId, e.MeetingId, e.IsDeleted });
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.MeetingId, e.IsHandRaised });

            entity.HasOne(e => e.Meeting)
                  .WithMany(m => m.Participants)
                  .HasForeignKey(e => e.MeetingId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MeetingAction>(entity =>
        {
            entity.Property(e => e.ActionType).HasConversion<string>();
            entity.HasIndex(e => new { e.MeetingId, e.CreatedAt });
            entity.HasIndex(e => e.ActorUserId);
            entity.HasIndex(e => e.TargetUserId);

            entity.HasOne(e => e.Meeting)
                  .WithMany(m => m.Actions)
                  .HasForeignKey(e => e.MeetingId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MeetingPoll>(entity =>
        {
            entity.Property(e => e.Question).IsRequired().HasMaxLength(500);
            entity.HasIndex(e => e.MeetingId);

            entity.HasOne(e => e.Meeting)
                  .WithMany(m => m.Polls)
                  .HasForeignKey(e => e.MeetingId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MeetingPollVote>(entity =>
        {
            entity.HasIndex(e => new { e.MeetingPollId, e.UserId });
            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.MeetingPoll)
                  .WithMany(p => p.Votes)
                  .HasForeignKey(e => e.MeetingPollId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserNotification>(entity =>
        {
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.ReferenceId).HasMaxLength(100);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TenantId);
            entity.HasIndex(e => new { e.UserId, e.IsRead });
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });
            entity.HasIndex(e => new { e.UserId, e.IsRead, e.CreatedAt });

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tenant)
                  .WithMany()
                  .HasForeignKey(e => e.TenantId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IssuedDocumentDetail>(entity =>
        {
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.FormNumber);
            entity.HasIndex(e => e.LicenseNumber);
            entity.HasIndex(e => e.CallSign);
            entity.HasIndex(e => e.OfficialReceiptNumber);

            entity.HasOne(e => e.Application)
                  .WithMany(a => a.IssuedDocumentDetails)
                  .HasForeignKey(e => e.ApplicationId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Applicant)
                  .WithMany()
                  .HasForeignKey(e => e.ApplicantId)
                  .OnDelete(DeleteBehavior.SetNull);
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
