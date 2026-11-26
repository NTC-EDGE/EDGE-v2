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

    public static readonly Guid CanonicalNoOfYearsFieldId = Guid.Parse("fd000000-0000-0000-0000-000000000201");

    /// <summary>
    /// Returns the canonical default variant visibility condition for a seeded field within one of the 13 Base Forms.
    /// Ensures "Number of Years" (noOfYears) is visible by default on multi-year New/Renewal/Vanity variants
    /// and hidden by default on Modification, Lifetime, Foreign Pilot, Purchase/Possess/Sell/Transfer/Storage/Transport,
    /// Construction/Demo Permit, and TVRO Registration Certificate variants.
    /// </summary>
    public static string? GetCanonicalFieldDefaultVisibilityCondition(string? serviceKeyOrFormKey, string? fieldKeyOrId)
    {
        if (string.IsNullOrWhiteSpace(serviceKeyOrFormKey) || string.IsNullOrWhiteSpace(fieldKeyOrId))
        {
            return null;
        }

        var fk = fieldKeyOrId.Trim();
        bool isNoOfYears = string.Equals(fk, "noOfYears", StringComparison.OrdinalIgnoreCase) ||
                           (Guid.TryParse(fk, out var parsedId) && parsedId == CanonicalNoOfYearsFieldId);
        if (!isNoOfYears)
        {
            return null;
        }

        var sk = serviceKeyOrFormKey.Trim().ToUpperInvariant();
        return sk switch
        {
            "NTC_1_02" => @"{""excludedVariants"":[""Modification"",""Temporary Radio Operator Certificate for Foreign Pilot (New)"",""Temporary Radio Operator Certificate for Foreign Pilot (Modification)""]}",
            "NTC_1_03" or "NTC_AMA_LICENSES" => @"{""excludedVariants"":[""Modification"",""Lifetime Amateur Radio Station License for Class A"",""Lifetime Amateur Radio Station License for Class A (New)"",""Lifetime Amateur Radio Station Supplementary Certificate (Modification)""]}",
            "NTC_1_04" => @"{""excludedVariants"":[""Modification""]}",
            "NTC_1_09" or "NTC_AERO_PERMITS" or "NTC_MAR_PERMITS" or "NTC_FLM_PERMITS" or "NTC_PTE_PERMITS" =>
                @"{""variants"":[""Special Permit for Use of Vanity Call Sign (New)"",""Special Permit for Use of Vanity Call Sign (Renewal)"",""Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor"",""Special Permit for the Use of Special Event Call Sign""]}",
            "NTC_1_11" or "NTC_AERO_LICENSES" or "NTC_OTHER_LICENSES" =>
                @"{""excludedVariants"":[""Modification"",""Construction Permit (New)"",""Construction Permit (Modification)"",""Temporary Permit to Demonstrate and Propagate""]}",
            "NTC_1_18" or "NTC_EQUIP_PERMITS" or "NTC_MP_PERMITS" =>
                @"{""excludedVariants"":[""Modification"",""Permit to Transport""]}",
            "NTC_1_22" or "NTC_TVRO_LICENSES" =>
                @"{""excludedVariants"":[""Modification"",""TVRO Registration Certificate (Commercial)"",""TVRO Registration Certificate (Non-Commercial)""]}",
            _ => null
        };
    }

    public static async Task SeedFormsInternalAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        // 1. Seed Central Reusable Fields Pool (Deterministic GUIDs)
        var fieldsPool = FastTrackSeederData.GetFieldsPool();

        var existingFields = await context.Fields.IgnoreQueryFilters().ToListAsync();
        bool anyFieldChange = false;
        foreach (var f in fieldsPool.Values)
        {
            var existing = existingFields.FirstOrDefault(x => x.Id == f.Id);
            if (existing == null)
            {
                context.Fields.Add(f);
                existingFields.Add(f);
                anyFieldChange = true;
            }
            else
            {
                if (existing.IsDeleted)
                {
                    existing.IsDeleted = false;
                    existing.IsDeletedBy = string.Empty;
                    anyFieldChange = true;
                }

                // Preserve custom dropdown options and validation rules set by admin in Form Builder.
                // Only seed default validation rules if the field currently has none.
                if ((string.IsNullOrWhiteSpace(existing.ValidationRules) || existing.ValidationRules == "{}" || existing.ValidationRules == "[]") &&
                    !string.IsNullOrWhiteSpace(f.ValidationRules) &&
                    existing.ValidationRules != f.ValidationRules)
                {
                    existing.ValidationRules = f.ValidationRules;
                    anyFieldChange = true;
                }

                if (string.IsNullOrWhiteSpace(existing.Label) && !string.IsNullOrWhiteSpace(f.Label))
                {
                    existing.Label = f.Label;
                    anyFieldChange = true;
                }

                if (string.IsNullOrWhiteSpace(existing.FieldType) && !string.IsNullOrWhiteSpace(f.FieldType))
                {
                    existing.FieldType = f.FieldType;
                    anyFieldChange = true;
                }
            }
        }
        if (anyFieldChange)
        {
            await context.SaveChangesAsync();
        }

        // 2. Self-heal any existing forbidden or duplicate FormSections and duplicate SectionFields globally before seeding
        var canonicalSectionKeys = FastTrackSeederData.GetAllFormDefs()
            .SelectMany(fd => fd.Sections.Select(s => (s.Key ?? string.Empty).Trim()))
            .Where(k => !string.IsNullOrEmpty(k))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var globalForbiddenSectionKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "applicant", "applicantPerson", "applicantAddress", "applicantContact", "applicantEducation",
            "applicantParticulars", "applicant_information", "applicantInfo", "personalInfo", "personal_information",
            "complainant", "typeOfCertificate", "permitType", "typeOfApplication", "applicationType",
            "declaration", "declarationAndUndertaking", "declaration_section", "payment", "paymentDetails", "fees", "accounting", "cashier",
            "deviceParticulars", "serviceProvider", "incidentParticulars", "natureOfComplaint", "details",
            "respondentParticulars", "complaintParticulars", "broadcastParticulars", "assistanceRequest", "bsd", "vasRegistration",
            "pointsOfCommunication"
        };

        var allDbSections = await context.FormSections.IgnoreQueryFilters().ToListAsync();
        var forbiddenDbSections = allDbSections
            .Where(s => globalForbiddenSectionKeys.Contains((s.Key ?? string.Empty).Trim()))
            .ToList();

        if (forbiddenDbSections.Count > 0)
        {
            var forbiddenSecIds = forbiddenDbSections.Select(s => s.Id).ToHashSet();
            var forbiddenSecFields = await context.SectionFields
                .Where(sf => forbiddenSecIds.Contains(sf.FormSectionId))
                .ToListAsync();
            if (forbiddenSecFields.Count > 0) context.SectionFields.RemoveRange(forbiddenSecFields);
            context.FormSections.RemoveRange(forbiddenDbSections);
            await context.SaveChangesAsync();
            allDbSections = allDbSections.Where(s => !forbiddenSecIds.Contains(s.Id)).ToList();
        }

        static string NormalizeTitleKey(string? title)
        {
            if (string.IsNullOrWhiteSpace(title)) return string.Empty;
            return new string(title.Trim().ToLowerInvariant().Where(char.IsLetterOrDigit).ToArray());
        }

        // 2a. Deduplicate FormSections by (FormId, Key) AND by (FormId, NormalizedTitle)
        for (int pass = 0; pass < 2; pass++)
        {
            var globalDuplicates = pass == 0
                ? allDbSections
                    .GroupBy(s => new { s.FormId, GroupKey = (s.Key ?? string.Empty).Trim().ToLowerInvariant() })
                    .Where(g => !string.IsNullOrEmpty(g.Key.GroupKey) && g.Count() > 1)
                    .ToList()
                : allDbSections
                    .GroupBy(s => new { s.FormId, GroupKey = NormalizeTitleKey(s.Title) })
                    .Where(g => !string.IsNullOrEmpty(g.Key.GroupKey) && g.Count() > 1)
                    .ToList();

            if (globalDuplicates.Count > 0)
            {
                var dupSectionIds = globalDuplicates.SelectMany(g => g.Select(s => s.Id)).ToList();
                var allDupSectionFields = await context.SectionFields
                    .Where(sf => dupSectionIds.Contains(sf.FormSectionId))
                    .ToListAsync();

                var removedSecIds = new HashSet<Guid>();
                int totalRemoved = 0;
                foreach (var group in globalDuplicates)
                {
                    // Prefer keeping a non-deleted section whose key is canonical and that actually has SectionFields
                    var keep = group
                        .OrderBy(s => s.IsDeleted)
                        .ThenByDescending(s => canonicalSectionKeys.Contains((s.Key ?? string.Empty).Trim()))
                        .ThenByDescending(s => allDupSectionFields.Count(sf => sf.FormSectionId == s.Id))
                        .ThenBy(s => s.OrderIndex)
                        .First();

                    var canonicalMatchKey = group
                        .Select(s => (s.Key ?? string.Empty).Trim())
                        .FirstOrDefault(k => canonicalSectionKeys.Contains(k));

                    var trimmedKey = !string.IsNullOrEmpty(canonicalMatchKey)
                        ? canonicalMatchKey
                        : (keep.Key ?? string.Empty).Trim();

                    if (keep.IsDeleted)
                    {
                        keep.IsDeleted = false;
                        keep.IsDeletedBy = string.Empty;
                    }
                    if (keep.Key != trimmedKey)
                    {
                        keep.Key = trimmedKey;
                    }

                    var toRemove = group.Where(s => s.Id != keep.Id).ToList();
                    var toRemoveIds = toRemove.Select(s => s.Id).ToHashSet();
                    var keepFieldIds = allDupSectionFields
                        .Where(sf => sf.FormSectionId == keep.Id)
                        .Select(sf => sf.FieldId)
                        .ToHashSet();

                    var toRemoveFields = allDupSectionFields
                        .Where(sf => toRemoveIds.Contains(sf.FormSectionId))
                        .ToList();

                    // Migrate any non-conflicting SectionFields from duplicate sections if keep has none for that FieldId
                    foreach (var dupSf in toRemoveFields)
                    {
                        if (keepFieldIds.Add(dupSf.FieldId))
                        {
                            context.SectionFields.Add(new SectionField
                            {
                                FormSectionId = keep.Id,
                                FieldId = dupSf.FieldId,
                                IsRequired = dupSf.IsRequired,
                                OrderIndex = dupSf.OrderIndex,
                                VisibilityCondition = dupSf.VisibilityCondition
                            });
                        }
                    }

                    if (toRemoveFields.Count > 0) context.SectionFields.RemoveRange(toRemoveFields);
                    context.FormSections.RemoveRange(toRemove);
                    foreach (var r in toRemove) removedSecIds.Add(r.Id);
                    totalRemoved += toRemove.Count;
                }
                await context.SaveChangesAsync();
                allDbSections = allDbSections.Where(s => !removedSecIds.Contains(s.Id)).ToList();
                logger?.LogInformation("Self-healing (pass {Pass}): Cleaned up {Count} duplicate FormSection entries across existing forms.", pass + 1, totalRemoved);
            }
        }

        // 2b. Self-heal duplicate SectionFields within the same FormSection (same FieldId or same normalized Label+Type, plus redundant equipment fields next to equipmentDetails repeater)
        var allSectionFields = await context.SectionFields.ToListAsync();
        if (allSectionFields.Count > 0)
        {
            var fieldById = existingFields.ToDictionary(f => f.Id, f => f);
            var redundantEquipmentFieldIds = new HashSet<Guid>
            {
                Guid.Parse("fd000000-0000-0000-0000-000000000270"), // makeModel
                Guid.Parse("fd000000-0000-0000-0000-000000000111"), // serialNumber
                Guid.Parse("fd000000-0000-0000-0000-000000000112"), // frequencyRange
                Guid.Parse("fd000000-0000-0000-0000-000000000106"), // powerOutput
                Guid.Parse("fd000000-0000-0000-0000-000000000025")  // classOfStation
            };
            var equipmentRepeaterId = Guid.Parse("fd000000-0000-0000-0000-000000000030");
            var sectionById = allDbSections.ToDictionary(s => s.Id, s => s);

            var sfsToRemove = new List<SectionField>();
            foreach (var secGroup in allSectionFields.GroupBy(sf => sf.FormSectionId))
            {
                bool isEquipmentSec = sectionById.TryGetValue(secGroup.Key, out var secEntity) &&
                    string.Equals((secEntity.Key ?? string.Empty).Trim(), "equipment", StringComparison.OrdinalIgnoreCase);
                bool hasEquipmentRepeater = isEquipmentSec && secGroup.Any(sf => sf.FieldId == equipmentRepeaterId);

                var seenFieldIdsInSec = new HashSet<Guid>();
                var seenLabelTypesInSec = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                // Order so deterministic canonical fd000000-... fields come first when deduplicating by Label+Type
                var orderedSfs = secGroup
                    .OrderBy(sf => sf.OrderIndex)
                    .ThenByDescending(sf => sf.FieldId.ToString().StartsWith("fd000000-", StringComparison.OrdinalIgnoreCase))
                    .ToList();

                foreach (var sf in orderedSfs)
                {
                    if (hasEquipmentRepeater && redundantEquipmentFieldIds.Contains(sf.FieldId))
                    {
                        sfsToRemove.Add(sf);
                        continue;
                    }

                    if (!seenFieldIdsInSec.Add(sf.FieldId))
                    {
                        sfsToRemove.Add(sf);
                        continue;
                    }

                    if (fieldById.TryGetValue(sf.FieldId, out var fld) &&
                        !string.Equals(fld.FieldType, "divider", StringComparison.OrdinalIgnoreCase))
                    {
                        bool isCanonicalFieldId = sf.FieldId.ToString().StartsWith("fd000000-", StringComparison.OrdinalIgnoreCase);
                        var normLbl = NormalizeTitleKey(fld.Label);
                        var normType = (fld.FieldType ?? "text").Trim().ToLowerInvariant();
                        if (!string.IsNullOrEmpty(normLbl))
                        {
                            var compositeKey = $"{normLbl}::{normType}";
                            if (!isCanonicalFieldId && !seenLabelTypesInSec.Add(compositeKey))
                            {
                                sfsToRemove.Add(sf);
                            }
                            else
                            {
                                seenLabelTypesInSec.Add(compositeKey);
                            }
                        }
                    }
                }
            }

            if (sfsToRemove.Count > 0)
            {
                context.SectionFields.RemoveRange(sfsToRemove);
                await context.SaveChangesAsync();
                logger?.LogInformation("Self-healing: Removed {Count} repetitive SectionField entries.", sfsToRemove.Count);
            }
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

        // 4. Purge only un-named deleted non-canonical forms that are not referenced by submissions or child forms
        var canonicalFormIds = formDefs.Select(f => f.FormId).ToHashSet();
        var obsoleteForms = await context.Forms
            .IgnoreQueryFilters()
            .Where(f => !canonicalFormIds.Contains(f.Id) && f.ServiceVariantId == null && f.BaseFormId == null && f.IsDeleted && string.IsNullOrWhiteSpace(f.Name))
            .ToListAsync();

        if (obsoleteForms.Count > 0)
        {
            var candidateIds = obsoleteForms.Select(f => f.Id).ToList();
            var referencedBySubmission = (await context.FormSubmissions
                .IgnoreQueryFilters()
                .Where(fs => candidateIds.Contains(fs.FormId))
                .Select(fs => fs.FormId)
                .Distinct()
                .ToListAsync())
                .ToHashSet();

            var referencedByBaseForm = (await context.Forms
                .IgnoreQueryFilters()
                .Where(f => f.BaseFormId.HasValue && candidateIds.Contains(f.BaseFormId.Value))
                .Select(f => f.BaseFormId!.Value)
                .Distinct()
                .ToListAsync())
                .ToHashSet();

            var safeToPurgeForms = obsoleteForms
                .Where(f => !referencedBySubmission.Contains(f.Id) && !referencedByBaseForm.Contains(f.Id))
                .ToList();

            if (safeToPurgeForms.Count > 0)
            {
                var obsoleteFormIds = safeToPurgeForms.Select(f => f.Id).ToList();
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
                context.Forms.RemoveRange(safeToPurgeForms);
                await context.SaveChangesAsync();
                logger?.LogInformation("Form Seeder: Cleaned up {Count} non-canonical redundant forms.", safeToPurgeForms.Count);
            }
        }

        // 5. Self-heal Single-Active Invariant: ensure at most ONE active Base Form per ServiceId and ONE active Variant Form per ServiceVariantId
        var allActiveNonDeleted = await context.Forms
            .IgnoreQueryFilters()
            .Where(f => !f.IsDeleted && f.IsActive)
            .OrderByDescending(f => canonicalFormIds.Contains(f.Id))
            .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
            .ToListAsync();

        bool deactivatedDuplicates = false;
        foreach (var baseGroup in allActiveNonDeleted.Where(f => !f.ServiceVariantId.HasValue && f.ServiceId != Guid.Empty).GroupBy(f => f.ServiceId))
        {
            foreach (var extra in baseGroup.Skip(1))
            {
                extra.IsActive = false;
                deactivatedDuplicates = true;
            }
        }
        foreach (var varGroup in allActiveNonDeleted.Where(f => f.ServiceVariantId.HasValue).GroupBy(f => f.ServiceVariantId!.Value))
        {
            foreach (var extra in varGroup.Skip(1))
            {
                extra.IsActive = false;
                deactivatedDuplicates = true;
            }
        }
        if (deactivatedDuplicates)
        {
            await context.SaveChangesAsync();
            logger?.LogInformation("Self-healing: Enforced single-active version invariant across Base and Variant forms.");
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
            .Where(f => (f.ServiceId == service.Id && f.ServiceVariantId == null && f.BaseFormId == null) || f.Id == formId)
            .ToListAsync();

        var targetForm = existingForms.FirstOrDefault(f => f.Id == formId)
                      ?? existingForms.FirstOrDefault(f => f.ServiceId == service.Id && f.ServiceVariantId == null && f.BaseFormId == null);

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
            bool wasModifiedByAdmin = targetForm.LastModifiedAt.HasValue;
            bool anotherActiveBaseVersionExists = existingForms.Any(f =>
                f.Id != targetForm.Id &&
                f.ServiceVariantId == null &&
                !f.IsDeleted &&
                f.IsActive);

            bool formChanged = false;
            if (targetForm.IsDeleted)
            {
                targetForm.IsDeleted = false;
                targetForm.IsDeletedBy = string.Empty;
                formChanged = true;
            }
            if (targetForm.ServiceId != service.Id)
            {
                targetForm.ServiceId = service.Id;
                formChanged = true;
            }
            if ((!wasModifiedByAdmin || string.IsNullOrWhiteSpace(targetForm.Name)) && targetForm.Name != resolvedFormName)
            {
                targetForm.Name = resolvedFormName;
                formChanged = true;
            }
            if (string.IsNullOrWhiteSpace(targetForm.Key))
            {
                targetForm.Key = serviceKey;
                formChanged = true;
            }
            if (!anotherActiveBaseVersionExists && !targetForm.IsActive)
            {
                targetForm.IsActive = true;
                formChanged = true;
            }

            if (formChanged)
            {
                await context.SaveChangesAsync();
            }

            // Only purge true corrupt same-version deleted duplicates that are not referenced by FormSubmissions or child Forms
            var redundantCandidates = existingForms
                .Where(f => f.Id != targetForm.Id &&
                            f.ServiceVariantId == null &&
                            f.BaseFormId == null &&
                            f.IsDeleted &&
                            string.Equals(f.Version, targetForm.Version, StringComparison.OrdinalIgnoreCase))
                .ToList();
            if (redundantCandidates.Count > 0)
            {
                var candidateIds = redundantCandidates.Select(f => f.Id).ToList();
                var refSubmissions = (await context.FormSubmissions
                    .IgnoreQueryFilters()
                    .Where(fs => candidateIds.Contains(fs.FormId))
                    .Select(fs => fs.FormId)
                    .Distinct()
                    .ToListAsync())
                    .ToHashSet();
                var refChildren = (await context.Forms
                    .IgnoreQueryFilters()
                    .Where(f => f.BaseFormId.HasValue && candidateIds.Contains(f.BaseFormId.Value))
                    .Select(f => f.BaseFormId!.Value)
                    .Distinct()
                    .ToListAsync())
                    .ToHashSet();

                var redundantForms = redundantCandidates
                    .Where(f => !refSubmissions.Contains(f.Id) && !refChildren.Contains(f.Id))
                    .ToList();

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
            var sec = existingSections.FirstOrDefault(s =>
                string.Equals((s.Key ?? string.Empty).Trim(), key, StringComparison.OrdinalIgnoreCase) ||
                string.Equals((s.Title ?? string.Empty).Trim(), title.Trim(), StringComparison.OrdinalIgnoreCase));
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
                bool secChanged = false;
                if (sec.IsDeleted)
                {
                    sec.IsDeleted = false;
                    sec.IsDeletedBy = string.Empty;
                    secChanged = true;
                }
                if (sec.Key != key)
                {
                    sec.Key = key;
                    secChanged = true;
                }
                // Preserve admin-customized section title and ordering if already modified
                if (!sec.LastModifiedAt.HasValue)
                {
                    if (sec.Title != title)
                    {
                        sec.Title = title;
                        secChanged = true;
                    }
                    if (sec.OrderIndex != sectionOrder)
                    {
                        sec.OrderIndex = sectionOrder;
                        secChanged = true;
                    }
                }
                sectionOrder++;
                if (secChanged)
                {
                    await context.SaveChangesAsync();
                }
            }

            var currentFields = await context.SectionFields
                .Where(sf => sf.FormSectionId == sec.Id)
                .ToListAsync();

            // Only seed baseline fields if the section currently has no fields.
            // Never wipe out fields added or modified by staff.
            if (currentFields.Count == 0 && fieldKeys != null && fieldKeys.Count > 0)
            {
                int fieldOrder = 1;
                var deduplicatedFields = fieldKeys.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
                var addedFieldIds = new HashSet<Guid>();
                foreach (var fk in deduplicatedFields)
                {
                    if (fieldsPool.TryGetValue(fk, out var f) && addedFieldIds.Add(f.Id))
                    {
                        context.SectionFields.Add(new SectionField
                        {
                            FormSectionId = sec.Id,
                            FieldId = f.Id,
                            IsRequired = fk != "callSign" && fk != "serviceArea" && fk != "exactLocation" && fk != "longitude" && fk != "latitude" && fk != "bsdNo" && fk != "antennaType" && fk != "height" && fk != "gain" && fk != "directivity" && fk != "diameter" && fk != "polarization" && fk != "beamwidth" && fk != "antennaRemarks" && key != "antennaSystem" && key != "signalReception" && key != "bsd" && key != "assistanceRequest" && key != "applicantEducation" && key != "knownByAnotherName" && key != "club" && key != "examination" && key != "radioOfficers" && key != "payment",
                            OrderIndex = fieldOrder++,
                            VisibilityCondition = GetCanonicalFieldDefaultVisibilityCondition(serviceKey, fk)
                        });
                    }
                }
                if (addedFieldIds.Count > 0)
                {
                    await context.SaveChangesAsync();
                }
            }
            else if (currentFields.Count > 0 &&
                     !targetForm.LastModifiedAt.HasValue &&
                     fieldKeys != null &&
                     fieldKeys.Contains("noOfYears", StringComparer.OrdinalIgnoreCase) &&
                     fieldsPool.TryGetValue("noOfYears", out var noOfYearsField))
            {
                // Backfill canonical "Number of Years" (noOfYears) and its default variant visibility condition on existing unmodified Base Forms
                var existingNoOfYearsSf = currentFields.FirstOrDefault(sf => sf.FieldId == noOfYearsField.Id);
                var defaultNoOfYearsCond = GetCanonicalFieldDefaultVisibilityCondition(serviceKey, "noOfYears");
                if (existingNoOfYearsSf == null)
                {
                    foreach (var sf in currentFields)
                    {
                        sf.OrderIndex += 1;
                    }
                    context.SectionFields.Add(new SectionField
                    {
                        FormSectionId = sec.Id,
                        FieldId = noOfYearsField.Id,
                        IsRequired = true,
                        OrderIndex = 1,
                        VisibilityCondition = defaultNoOfYearsCond
                    });
                    await context.SaveChangesAsync();
                }
                else if (string.IsNullOrWhiteSpace(existingNoOfYearsSf.VisibilityCondition) &&
                         !string.IsNullOrWhiteSpace(defaultNoOfYearsCond))
                {
                    existingNoOfYearsSf.VisibilityCondition = defaultNoOfYearsCond;
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
