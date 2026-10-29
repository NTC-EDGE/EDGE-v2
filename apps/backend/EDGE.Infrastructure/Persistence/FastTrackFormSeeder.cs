using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Persistence;

/// <summary>
/// Handles synchronization and seeding of Form Definitions, Sections, and Fields.
/// </summary>
public static class FastTrackFormSeeder
{
    private static readonly Dictionary<string, string> CanonicalFormDisplayNames = new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_01"] = "NTC 1-01: Radio Operator Examination",
        ["NTC_1_02"] = "NTC 1-02: Commercial Radio Operator Certificate",
        ["NTC_1_03"] = "NTC 1-03: Amateur Radio Operator Certificate & License",
        ["NTC_1_04"] = "NTC 1-04: Ship Station License",
        ["NTC_1_09"] = "NTC 1-09: Permit to Purchase / Possess / Storage / Sell / Transfer",
        ["NTC_1_11"] = "NTC 1-11: Radio Station License",
        ["NTC_1_18"] = "NTC 1-18: CPE Supplier Accreditation & Equipment / Mobile Phone Permit",
        ["NTC_1_19"] = "NTC 1-19: RFID / SRD / WDN Registration",
        ["NTC_1_20"] = "NTC 1-20: Value-Added Service (VAS) Registration",
        ["NTC_1_21"] = "NTC 1-21: Certified True Copy / Duplicate Copy",
        ["NTC_1_22"] = "NTC 1-22: TVRO Registration & Station License",
        ["NTC_1_24"] = "NTC 1-24: Request for Blocking / Unblocking of IMEI and SIM",
        ["NTC_1_25"] = "NTC 1-25: Consumer Complaints & Tape Preservation"
    };

    public static async Task SeedFormsInternalAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        // 1. Seed Central Reusable Fields Pool (Deterministic GUIDs)
        var fieldsPool = FastTrackSeederData.GetFieldsPool();

        var existingFields = await context.Fields.IgnoreQueryFilters().ToListAsync();
        foreach (var f in fieldsPool.Values)
        {
            var existing = existingFields.FirstOrDefault(x => x.Id == f.Id);
            if (existing == null)
            {
                context.Fields.Add(f);
            }
            else if (existing.Label != f.Label || existing.FieldType != f.FieldType || existing.ValidationRules != f.ValidationRules || existing.SyncBackOnSubmit != f.SyncBackOnSubmit || existing.IsDeleted)
            {
                existing.IsDeleted = false;
                existing.IsDeletedBy = string.Empty;
                existing.Label = f.Label;
                existing.FieldType = f.FieldType;
                existing.ValidationRules = f.ValidationRules;
                existing.SyncBackOnSubmit = f.SyncBackOnSubmit;
            }
        }
        await context.SaveChangesAsync();

        // 2. Self-heal any existing duplicate FormSections globally before seeding
        var allDbSections = await context.FormSections.IgnoreQueryFilters().ToListAsync();
        var globalDuplicates = allDbSections
            .GroupBy(s => new { s.FormId, Key = (s.Key ?? string.Empty).Trim().ToLowerInvariant() })
            .Where(g => g.Count() > 1)
            .ToList();

        if (globalDuplicates.Count > 0)
        {
            int totalRemoved = 0;
            foreach (var group in globalDuplicates)
            {
                var keep = group.FirstOrDefault(s => !s.IsDeleted) ?? group.First();
                var toRemove = group.Where(s => s.Id != keep.Id).ToList();
                var toRemoveIds = toRemove.Select(s => s.Id).ToList();
                var toRemoveFields = await context.SectionFields
                    .Where(sf => toRemoveIds.Contains(sf.FormSectionId))
                    .ToListAsync();
                if (toRemoveFields.Count > 0) context.SectionFields.RemoveRange(toRemoveFields);
                context.FormSections.RemoveRange(toRemove);
                totalRemoved += toRemove.Count;
            }
            await context.SaveChangesAsync();
            logger?.LogInformation("Self-healing: Cleaned up {Count} duplicate FormSection entries across existing forms.", totalRemoved);
        }

        // 2b. Purge any legacy entity-backed sections (Personal Information, Declaration, and Payment)
        // These are managed directly on first-class domain entities (Applicant, Application, OrderOfPayment, StatementOfAccount)
        // and must never exist as dynamic FormSections in Form Builders.
        var forbiddenKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "applicant",
            "applicantPerson",
            "applicantAddress",
            "applicantContact",
            "applicantEducation",
            "applicantParticulars",
            "applicant_information",
            "applicantInfo",
            "personalInfo",
            "personal_information",
            "complainant",
            "typeOfCertificate",
            "permitType",
            "typeOfApplication",
            "applicationType",
            "declaration",
            "declarationAndUndertaking",
            "declaration_section",
            "payment",
            "paymentDetails",
            "fees",
            "accounting",
            "cashier",
            "deviceParticulars",
            "serviceProvider",
            "incidentParticulars",
            "natureOfComplaint",
            "details",
            "respondentParticulars",
            "complaintParticulars",
            "broadcastParticulars",
            "assistanceRequest",
            "bsd",
            "vasRegistration"
        };

        var allSectionsForCleanup = await context.FormSections.IgnoreQueryFilters().ToListAsync();
        var forbiddenSections = allSectionsForCleanup
            .Where(s =>
                forbiddenKeys.Contains((s.Key ?? string.Empty).Trim()) ||
                (!string.IsNullOrWhiteSpace(s.Title) && (
                    s.Title.Contains("Applicant", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Personal Information", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Address Information", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Contact Information", StringComparison.OrdinalIgnoreCase) ||
                    false ||
                    s.Title.Contains("Complainant", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Declaration", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Acknowledgement and Signature", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Payment", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Fee", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Accounting", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Cashier", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Type of Application", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Type of Certificate", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Permit Category", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Special Needs Assistance", StringComparison.OrdinalIgnoreCase) ||
                    s.Title.Contains("Broadcast Services Division", StringComparison.OrdinalIgnoreCase)
                ))
            )
            .ToList();

        if (forbiddenSections.Count > 0)
        {
            var forbiddenSecIds = forbiddenSections.Select(s => s.Id).ToList();
            var forbiddenSecFields = await context.SectionFields
                .Where(sf => forbiddenSecIds.Contains(sf.FormSectionId))
                .ToListAsync();
            if (forbiddenSecFields.Count > 0) context.SectionFields.RemoveRange(forbiddenSecFields);
            context.FormSections.RemoveRange(forbiddenSections);
            await context.SaveChangesAsync();
            logger?.LogInformation("Form Seeder: Cleaned up {Count} legacy entity-backed sections (Personal Info, Declaration, Payment) from FormSections.", forbiddenSections.Count);
        }

        // 3. Seed Form Builders & Sections per Service
        var services = new Dictionary<string, Service>();
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        foreach (var formDef in formDefs)
        {
            await SeedFormForService(
                context,
                services,
                fieldsPool,
                formDef.ServiceKey,
                formDef.FormId,
                formDef.Sections.Select(s => (s.Key, s.Title, s.FieldKeys)).ToList(),
                logger
            );
        }

        // 4. Purge any non-canonical redundant forms that are no longer part of the canonical form set
        var canonicalFormIds = formDefs.Select(f => f.FormId).ToHashSet();
        var obsoleteForms = await context.Forms
            .IgnoreQueryFilters()
            .Where(f => !canonicalFormIds.Contains(f.Id))
            .ToListAsync();

        if (obsoleteForms.Count > 0)
        {
            var obsoleteFormIds = obsoleteForms.Select(f => f.Id).ToList();
            var obsoleteSections = await context.FormSections
                .IgnoreQueryFilters()
                .Where(s => obsoleteFormIds.Contains(s.FormId))
                .ToListAsync();
            if (obsoleteSections.Count > 0)
            {
                var obsoleteSecIds = obsoleteSections.Select(s => s.Id).ToList();
                var obsoleteSecFields = await context.SectionFields
                    .Where(sf => obsoleteSecIds.Contains(sf.FormSectionId))
                    .ToListAsync();
                if (obsoleteSecFields.Count > 0) context.SectionFields.RemoveRange(obsoleteSecFields);
                context.FormSections.RemoveRange(obsoleteSections);
            }
            context.Forms.RemoveRange(obsoleteForms);
            await context.SaveChangesAsync();
            logger?.LogInformation("Form Seeder: Cleaned up {Count} non-canonical redundant forms.", obsoleteForms.Count);
        }
    }

    private static async Task SeedFormForService(
        ApplicationDbContext context,
        Dictionary<string, Service> services,
        Dictionary<string, Field> fieldsPool,
        string serviceKey,
        Guid formId,
        List<(string Key, string Title, List<string> FieldKeys)> sectionDefs,
        ILogger? logger = null)
    {
        if (!services.TryGetValue(serviceKey, out var service))
        {
            service = await context.Services.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.Code == serviceKey);
            if (service == null) return;
            services[serviceKey] = service;
        }

        var existingForms = await context.Forms
            .IgnoreQueryFilters()
            .Where(f => f.ServiceId == service.Id || f.Id == formId)
            .ToListAsync();

        var targetForm = existingForms.FirstOrDefault(f => f.Id == formId)
                      ?? existingForms.FirstOrDefault(f => f.ServiceId == service.Id);

        var resolvedFormName = CanonicalFormDisplayNames.TryGetValue(serviceKey, out var displayName)
            ? displayName
            : service.Name;

        if (targetForm == null)
        {
            targetForm = new Form
            {
                Id = formId,
                ServiceId = service.Id,
                Key = serviceKey,
                Name = resolvedFormName,
                Version = "1.0",
                IsActive = true,
                CategorySelectionRequired = false
            };
            context.Forms.Add(targetForm);
            await context.SaveChangesAsync();
        }
        else
        {
            targetForm.IsDeleted = false;
            targetForm.IsDeletedBy = string.Empty;
            targetForm.ServiceId = service.Id;
            targetForm.Name = resolvedFormName;
            if (string.IsNullOrWhiteSpace(targetForm.Key)) targetForm.Key = serviceKey;
            targetForm.IsActive = true;

            var redundantForms = existingForms.Where(f => f.Id != targetForm.Id).ToList();
            if (redundantForms.Count > 0)
            {
                var redundantFormIds = redundantForms.Select(f => f.Id).ToList();
                var redundantSections = await context.FormSections
                    .IgnoreQueryFilters()
                    .Where(s => redundantFormIds.Contains(s.FormId))
                    .ToListAsync();
                if (redundantSections.Count > 0)
                {
                    var redundantSecIds = redundantSections.Select(s => s.Id).ToList();
                    var redundantSecFields = await context.SectionFields
                        .Where(sf => redundantSecIds.Contains(sf.FormSectionId))
                        .ToListAsync();
                    if (redundantSecFields.Count > 0) context.SectionFields.RemoveRange(redundantSecFields);
                    context.FormSections.RemoveRange(redundantSections);
                }
                context.Forms.RemoveRange(redundantForms);
                await context.SaveChangesAsync();
            }
        }

        var existingSections = await context.FormSections
            .IgnoreQueryFilters()
            .Where(s => s.FormId == targetForm.Id)
            .ToListAsync();

        var deduplicatedSections = sectionDefs
            .GroupBy(s => (s.Key ?? string.Empty).Trim(), StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();

        // Preserve all existing and custom sections created by staff.
        // We only add missing baseline sections; we do not purge user-created sections.
        int sectionOrder = 1;
        var forbiddenSectionKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "applicant", "applicantPerson", "applicantAddress", "applicantContact", "applicantEducation",
            "applicantParticulars", "applicant_information", "applicantInfo", "personalInfo", "personal_information",
            "complainant", "typeOfCertificate", "permitType", "typeOfApplication", "applicationType",
            "declaration", "declarationAndUndertaking", "declaration_section", "payment", "paymentDetails", "fees", "accounting", "cashier",
            "deviceParticulars", "serviceProvider", "incidentParticulars", "natureOfComplaint", "details",
            "respondentParticulars", "complaintParticulars", "broadcastParticulars", "assistanceRequest", "bsd", "vasRegistration"
        };

        foreach (var (rawKey, title, fieldKeys) in deduplicatedSections)
        {
            var key = rawKey.Trim();
            if (forbiddenSectionKeys.Contains(key)) continue;
            var sec = existingSections.FirstOrDefault(s => string.Equals((s.Key ?? string.Empty).Trim(), key, StringComparison.OrdinalIgnoreCase));
            if (sec == null)
            {
                sec = new FormSection
                {
                    Id = Guid.NewGuid(),
                    FormId = targetForm.Id,
                    Key = key,
                    Title = title,
                    OrderIndex = sectionOrder++
                };
                context.FormSections.Add(sec);
                await context.SaveChangesAsync();
                existingSections.Add(sec);
            }
            else
            {
                sec.IsDeleted = false;
                sec.IsDeletedBy = string.Empty;
                sec.Key = key;
                sec.Title = title;
                sec.OrderIndex = sectionOrder++;
                await context.SaveChangesAsync();
            }

            var currentFields = await context.SectionFields
                .Where(sf => sf.FormSectionId == sec.Id)
                .ToListAsync();

            // Only seed baseline fields if the section currently has no fields.
            // Never wipe out fields added or modified by staff.
            if (currentFields.Count == 0 && fieldKeys != null && fieldKeys.Count > 0)
            {
                int fieldOrder = 1;
                var deduplicatedFields = fieldKeys.Distinct().ToList();
                foreach (var fk in deduplicatedFields)
                {
                    if (fieldsPool.TryGetValue(fk, out var f))
                    {
                        context.SectionFields.Add(new SectionField
                        {
                            FormSectionId = sec.Id,
                            FieldId = f.Id,
                            IsRequired = fk != "callSign" && fk != "serviceArea" && fk != "exactLocation" && fk != "longitude" && fk != "latitude" && fk != "bsdNo" && fk != "antennaType" && fk != "height" && fk != "gain" && fk != "directivity" && fk != "diameter" && fk != "polarization" && fk != "beamwidth" && fk != "antennaRemarks" && key != "antennaSystem" && key != "signalReception" && key != "bsd" && key != "assistanceRequest" && key != "applicantEducation" && key != "knownByAnotherName" && key != "club" && key != "examination" && key != "radioOfficers" && key != "payment",
                            OrderIndex = fieldOrder++
                        });
                    }
                }
                await context.SaveChangesAsync();
            }

        }
    }
}
