using System.Text.Json;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

/// <summary>
/// Seeds the 6 core ServiceCategory records and representative Services/Variants
/// for the NTC-EDGE catalog. Idempotent — exits early if categories already exist.
/// </summary>
public static class CatalogDataSeeder
{
    // ── Static Tenant Reference ────────────────────────────────────────────
    private static readonly Guid DefaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    // ── ServiceCategory IDs ────────────────────────────────────────────────
    private static readonly Guid AccreditationsCategoryId       = Guid.Parse("C0000001-0000-0000-0000-000000000001");
    private static readonly Guid CertificatesCategoryId         = Guid.Parse("C0000001-0000-0000-0000-000000000002");
    private static readonly Guid PermitsCategoryId              = Guid.Parse("C0000001-0000-0000-0000-000000000003");
    private static readonly Guid LicensesCategoryId             = Guid.Parse("C0000001-0000-0000-0000-000000000004");
    private static readonly Guid ExamsCategoryId                = Guid.Parse("C0000001-0000-0000-0000-000000000005");
    private static readonly Guid TechnicalAppsCategoryId        = Guid.Parse("C0000001-0000-0000-0000-000000000006");

    // ── Service IDs ────────────────────────────────────────────────────────
    private static readonly Guid AccreditationServiceId         = Guid.Parse("C0000002-0000-0000-0000-000000000001");
    private static readonly Guid CertificateServiceId           = Guid.Parse("C0000002-0000-0000-0000-000000000002");
    private static readonly Guid PermitServiceId                = Guid.Parse("C0000002-0000-0000-0000-000000000003");
    private static readonly Guid LicenseServiceId               = Guid.Parse("C0000002-0000-0000-0000-000000000004");
    private static readonly Guid ExamServiceId                  = Guid.Parse("C0000002-0000-0000-0000-000000000005");
    private static readonly Guid TechnicalAppServiceId          = Guid.Parse("C0000002-0000-0000-0000-000000000006");

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.ServiceCategories.AnyAsync())
        {
            return;
        }

        var staticDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // ── Seed ServiceCategories ─────────────────────────────────────────
        var categories = new List<ServiceCategory>
        {
            new() { Id = AccreditationsCategoryId,  Type = ServiceCategoryType.Accreditations,      Name = "Accreditations",       Code = "ACCRED",  CreatedAt = staticDate },
            new() { Id = CertificatesCategoryId,    Type = ServiceCategoryType.Certificates,        Name = "Certificates",         Code = "CERT",    CreatedAt = staticDate },
            new() { Id = PermitsCategoryId,         Type = ServiceCategoryType.Permits,             Name = "Permits",              Code = "PERMIT",  CreatedAt = staticDate },
            new() { Id = LicensesCategoryId,        Type = ServiceCategoryType.Licenses,            Name = "Licenses",             Code = "LIC",     CreatedAt = staticDate },
            new() { Id = ExamsCategoryId,           Type = ServiceCategoryType.Exams,               Name = "Examinations",         Code = "EXAM",    CreatedAt = staticDate },
            new() { Id = TechnicalAppsCategoryId,   Type = ServiceCategoryType.TechnicalApplications, Name = "Technical Applications", Code = "TECHAPP", CreatedAt = staticDate },
        };
        await context.ServiceCategories.AddRangeAsync(categories);

        // ── Seed Sample Services ───────────────────────────────────────────
        var services = new List<Service>
        {
            new()
            {
                Id = AccreditationServiceId,
                ServiceCategoryId = AccreditationsCategoryId,
                TenantId = DefaultTenantId,
                Name = "Radio Station Accreditation",
                Code = "NTC 1-01",
                Group = "Broadcasting",
                Description = "Accreditation of radio broadcasting stations.",
                Contract = BuildContract(new
                {
                    formNo = "NTC 1-01",
                }),
                CreatedAt = staticDate
            },
            new()
            {
                Id = CertificateServiceId,
                ServiceCategoryId = CertificatesCategoryId,
                TenantId = DefaultTenantId,
                Name = "Type Acceptance Certificate",
                Code = "NTC 2-01",
                Group = "Equipment",
                Description = "Certificate of type acceptance for radio communications equipment.",
                Contract = BuildContract(new
                {
                    formNo = "NTC 2-01",
                }),
                CreatedAt = staticDate
            },
            new()
            {
                Id = PermitServiceId,
                ServiceCategoryId = PermitsCategoryId,
                TenantId = DefaultTenantId,
                Name = "Radio Station Permit",
                Code = "NTC 3-01",
                Group = "Broadcasting",
                Description = "Permit to operate a radio station.",
                Contract = BuildContract(new
                {
                    formNo = "NTC 3-01",
                }),
                CreatedAt = staticDate
            },
            new()
            {
                Id = LicenseServiceId,
                ServiceCategoryId = LicensesCategoryId,
                TenantId = DefaultTenantId,
                Name = "Amateur Radio Operator License",
                Code = "NTC 4-01",
                Group = "Operator",
                Description = "License for amateur radio operators.",
                Contract = BuildContract(new
                {
                    formNo = "NTC 4-01",
                }),
                CreatedAt = staticDate
            },
            new()
            {
                Id = ExamServiceId,
                ServiceCategoryId = ExamsCategoryId,
                TenantId = DefaultTenantId,
                Name = "Electronics Engineer Licensure Examination",
                Code = "NTC 5-01",
                Group = "Professional",
                Description = "Licensure examination for electronics engineers.",
                Contract = BuildContract(new
                {
                    formNo = "NTC 5-01",
                    examineeTypes = new[] { "New", "Retaker" }
                }),
                CreatedAt = staticDate
            },
            new()
            {
                Id = TechnicalAppServiceId,
                ServiceCategoryId = TechnicalAppsCategoryId,
                TenantId = DefaultTenantId,
                Name = "Technical Application for Frequency Assignment",
                Code = "NTC 6-01",
                Group = "Frequency",
                Description = "Application for the assignment of radio frequency spectrum.",
                Contract = BuildContract(new
                {
                    formNo = "NTC 6-01",
                    elements = new[]
                    {
                        new { key = "frequencyBand", label = "Frequency Band", type = "select", required = true },
                        new { key = "powerOutput",   label = "Power Output (Watts)", type = "number", required = true },
                        new { key = "location",      label = "Station Location",     type = "text",   required = true }
                    }
                }),
                CreatedAt = staticDate
            },
        };
        await context.Services.AddRangeAsync(services);

        // ── Seed Sample ServiceVariants ────────────────────────────────────
        int variantCounter = 1;
        Guid NextVariantId() => Guid.Parse($"C0000003-0000-0000-0000-{variantCounter++:D12}");

        var variants = new List<ServiceVariant>
        {
            // Accreditation variants
            new() { Id = NextVariantId(), ServiceId = AccreditationServiceId, Type = ServiceVariantType.New,      Description = "Initial accreditation application.",         CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = AccreditationServiceId, Type = ServiceVariantType.Renewal,  Description = "Renewal of existing accreditation.",        CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = AccreditationServiceId, Type = ServiceVariantType.Modification, Description = "Modification of accredited details.",   CreatedAt = staticDate },

            // Certificate variants
            new() { Id = NextVariantId(), ServiceId = CertificateServiceId,   Type = ServiceVariantType.New,      Description = "First-time type acceptance application.",   CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = CertificateServiceId,   Type = ServiceVariantType.Renewal,  Description = "Certificate renewal.",                     CreatedAt = staticDate },

            // Permit variants
            new() { Id = NextVariantId(), ServiceId = PermitServiceId,        Type = ServiceVariantType.New,      Description = "New radio station permit.",                 CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = PermitServiceId,        Type = ServiceVariantType.Renewal,  Description = "Annual permit renewal.",                   CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = PermitServiceId,        Type = ServiceVariantType.Upgrade,  Description = "Upgrade to a higher-class permit.",        CreatedAt = staticDate },

            // License variants
            new() { Id = NextVariantId(), ServiceId = LicenseServiceId,       Type = ServiceVariantType.New,      Description = "Initial license application.",             CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = LicenseServiceId,       Type = ServiceVariantType.Renewal,  Description = "License renewal.",                        CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = LicenseServiceId,       Type = ServiceVariantType.Upgrade,  Description = "Upgrade to a higher license class.",       CreatedAt = staticDate },

            // Exam variants
            new() { Id = NextVariantId(), ServiceId = ExamServiceId,          Type = ServiceVariantType.FirstTaker, Description = "Sitting the exam for the first time.", CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = ExamServiceId,          Type = ServiceVariantType.Retaker,  Description = "Re-taking a previously failed exam.",     CreatedAt = staticDate },

            // Technical Application variants
            new() { Id = NextVariantId(), ServiceId = TechnicalAppServiceId,  Type = ServiceVariantType.New,      Description = "New frequency assignment application.",    CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = TechnicalAppServiceId,  Type = ServiceVariantType.Renewal,  Description = "Renewal of frequency assignment.",        CreatedAt = staticDate },
            new() { Id = NextVariantId(), ServiceId = TechnicalAppServiceId,  Type = ServiceVariantType.Modification, Description = "Modification of frequency parameters.", CreatedAt = staticDate },
        };
        await context.ServiceVariants.AddRangeAsync(variants);

        await context.SaveChangesAsync();
    }

    private static JsonDocument BuildContract(object contractShape)
    {
        var json = JsonSerializer.Serialize(contractShape);
        return JsonDocument.Parse(json);
    }
}
