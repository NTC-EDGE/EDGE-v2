using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Services.Dtos;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class FormRepository : IFormRepository
{
    private readonly ApplicationDbContext _context;

    public FormRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Fallback map linking grouped/composite services to their primary canonical form service.
    /// This guarantees that when a client files for any sub-service (e.g. SvcLicMarId for Ship Station),
    /// the system always resolves the fully seeded canonical form layout.
    /// </summary>
    private static readonly Dictionary<Guid, Guid> ServiceToCanonicalServiceMap = new()
    {
        // Permits sharing NTC 1-09 (Svc109Id = 50000000-0000-0000-0000-000000000009)
        [Guid.Parse("50000000-0000-0000-0000-000000000060")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_AERO_PERMITS -> NTC_1_09
        [Guid.Parse("50000000-0000-0000-0000-000000000061")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_MAR_PERMITS -> NTC_1_09
        [Guid.Parse("50000000-0000-0000-0000-000000000062")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_FLM_PERMITS -> NTC_1_09
        [Guid.Parse("50000000-0000-0000-0000-000000000063")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_PTE_PERMITS -> NTC_1_09
        // Legacy Permit IDs -> NTC_1_09
        [Guid.Parse("40000000-0000-0000-0000-000000000009")] = Guid.Parse("50000000-0000-0000-0000-000000000009"),
        [Guid.Parse("40000000-0000-0000-0000-000000000070")] = Guid.Parse("50000000-0000-0000-0000-000000000009"),
        [Guid.Parse("40000000-0000-0000-0000-000000000071")] = Guid.Parse("50000000-0000-0000-0000-000000000009"),
        [Guid.Parse("40000000-0000-0000-0000-000000000072")] = Guid.Parse("50000000-0000-0000-0000-000000000009"),
        [Guid.Parse("40000000-0000-0000-0000-000000000073")] = Guid.Parse("50000000-0000-0000-0000-000000000009"),

        // Licenses sharing NTC 1-11 (SvcLicFlmId = 50000000-0000-0000-0000-000000000073)
        [Guid.Parse("50000000-0000-0000-0000-000000000070")] = Guid.Parse("50000000-0000-0000-0000-000000000003"), // SvcLicAmaId -> NTC_1_03 (CertificatesCategory Svc103Id)
        [Guid.Parse("50000000-0000-0000-0000-000000000071")] = Guid.Parse("50000000-0000-0000-0000-000000000073"), // NTC_AERO_LICENSES -> NTC_1_11 (SvcLicFlmId)
        [Guid.Parse("50000000-0000-0000-0000-000000000074")] = Guid.Parse("50000000-0000-0000-0000-000000000073"), // NTC_OTHER_LICENSES -> NTC_1_11 (SvcLicFlmId)
        [Guid.Parse("50000000-0000-0000-0000-000000000011")] = Guid.Parse("50000000-0000-0000-0000-000000000073"), // Legacy Svc111Id -> SvcLicFlmId
        [Guid.Parse("50000000-0000-0000-0000-000000000014")] = Guid.Parse("50000000-0000-0000-0000-000000000073"),

        // Permits & Accreditations sharing NTC 1-18 (Svc118Id = 50000000-0000-0000-0000-000000000018)
        [Guid.Parse("50000000-0000-0000-0000-000000000064")] = Guid.Parse("50000000-0000-0000-0000-000000000018"), // NTC_EQUIP_PERMITS -> NTC_1_18
        [Guid.Parse("50000000-0000-0000-0000-000000000065")] = Guid.Parse("50000000-0000-0000-0000-000000000018"), // NTC_MP_PERMITS -> NTC_1_18
        [Guid.Parse("10000000-0000-0000-0000-000000000018")] = Guid.Parse("50000000-0000-0000-0000-000000000018"),
        [Guid.Parse("40000000-0000-0000-0000-000000000074")] = Guid.Parse("50000000-0000-0000-0000-000000000018"),
        [Guid.Parse("40000000-0000-0000-0000-000000000075")] = Guid.Parse("50000000-0000-0000-0000-000000000018"),

        // Copies sharing NTC 1-21 (Svc121Id = 50000000-0000-0000-0000-000000000021)
        [Guid.Parse("50000000-0000-0000-0000-000000000066")] = Guid.Parse("50000000-0000-0000-0000-000000000021"), // NTC_COPY_PERMITS -> NTC_1_21
        [Guid.Parse("50000000-0000-0000-0000-000000000076")] = Guid.Parse("50000000-0000-0000-0000-000000000021"), // NTC_COPY_LICENSES -> NTC_1_21
        [Guid.Parse("40000000-0000-0000-0000-000000000076")] = Guid.Parse("50000000-0000-0000-0000-000000000021"),
        [Guid.Parse("40000000-0000-0000-0000-000000000021")] = Guid.Parse("50000000-0000-0000-0000-000000000021"),

        // Amateur Licenses sharing NTC 1-03 (Svc103Id = 50000000-0000-0000-0000-000000000003)
        [Guid.Parse("20000000-0000-0000-0000-000000000003")] = Guid.Parse("50000000-0000-0000-0000-000000000003"),
        [Guid.Parse("50000000-0000-0000-0000-000000000012")] = Guid.Parse("50000000-0000-0000-0000-000000000003"),

        // TVRO CATV sharing NTC 1-22 (Svc122Id = 50000000-0000-0000-0000-000000000022)
        [Guid.Parse("50000000-0000-0000-0000-000000000075")] = Guid.Parse("50000000-0000-0000-0000-000000000022"), // NTC_TVRO_CATV_LICENSES -> NTC_1_22
        [Guid.Parse("50000000-0000-0000-0000-000000000016")] = Guid.Parse("50000000-0000-0000-0000-000000000022"),

        // Maritime License (SvcLicMarId = 50000000-0000-0000-0000-000000000072 - NTC 1-04)
        [Guid.Parse("50000000-0000-0000-0000-000000000013")] = Guid.Parse("50000000-0000-0000-0000-000000000072"),
    };

    public Guid ResolveCanonicalServiceId(Guid serviceId)
    {
        if (serviceId == Guid.Empty) return Guid.Empty;
        return ServiceToCanonicalServiceMap.TryGetValue(serviceId, out var canonicalId)
            ? canonicalId
            : serviceId;
    }

    public IReadOnlyCollection<Guid> GetCanonicalServiceGroupIds(Guid serviceId)
    {
        var set = new HashSet<Guid>();
        if (serviceId == Guid.Empty) return set;

        var canonicalId = ResolveCanonicalServiceId(serviceId);
        set.Add(serviceId);
        set.Add(canonicalId);

        foreach (var kvp in ServiceToCanonicalServiceMap)
        {
            if (kvp.Value == canonicalId || kvp.Key == canonicalId)
            {
                set.Add(kvp.Key);
                set.Add(kvp.Value);
            }
        }

        return set;
    }

    public static string FormatVariantTypeLabel(ServiceVariantType type) => type switch
    {
        ServiceVariantType.NA => string.Empty,
        ServiceVariantType.FirstTaker => "First Taker",
        ServiceVariantType.CivicActionGroup => "Civic Action Group",
        _ => type.ToString()
    };

    public static string FormatVariantDisplayName(ServiceVariant variant)
    {
        var desc = (variant.Description ?? string.Empty).Trim();
        var typeLabel = FormatVariantTypeLabel(variant.Type);
        var rawType = variant.Type == ServiceVariantType.NA ? string.Empty : variant.Type.ToString();

        if (string.IsNullOrEmpty(desc))
        {
            return !string.IsNullOrEmpty(typeLabel) ? typeLabel : "Variant";
        }

        if (string.IsNullOrEmpty(typeLabel))
        {
            return desc;
        }

        if (desc.EndsWith($"({typeLabel})", StringComparison.OrdinalIgnoreCase) ||
            (!string.IsNullOrEmpty(rawType) && desc.EndsWith($"({rawType})", StringComparison.OrdinalIgnoreCase)))
        {
            return desc;
        }

        return $"{desc} ({typeLabel})";
    }

    private static string NormalizeAlphaNum(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        return Regex.Replace(input.Trim().ToLowerInvariant(), "[^a-z0-9]", string.Empty);
    }

    public static bool VariantRuleMatchesVariant(string ruleToken, ServiceVariant variant)
    {
        if (string.IsNullOrWhiteSpace(ruleToken)) return false;
        var trimmed = ruleToken.Trim();
        if (string.Equals(trimmed, "__NONE__", StringComparison.OrdinalIgnoreCase)) return false;
        if (string.Equals(trimmed, "ALL", StringComparison.OrdinalIgnoreCase)) return true;

        if (Guid.TryParse(trimmed, out var parsedGuid) && parsedGuid == variant.Id)
        {
            return true;
        }

        var normRule = NormalizeAlphaNum(trimmed);
        if (string.IsNullOrEmpty(normRule)) return false;

        var displayName = FormatVariantDisplayName(variant);
        var rawCombined = !string.IsNullOrWhiteSpace(variant.Description) && variant.Type != ServiceVariantType.NA
            ? $"{variant.Description.Trim()} ({variant.Type})"
            : (variant.Description ?? variant.Type.ToString());

        var normDisplay = NormalizeAlphaNum(displayName);
        var normRawCombined = NormalizeAlphaNum(rawCombined);
        var normDesc = NormalizeAlphaNum(variant.Description);
        var normType = variant.Type == ServiceVariantType.NA ? string.Empty : NormalizeAlphaNum(variant.Type.ToString());

        if (normRule == normDisplay || normRule == normRawCombined) return true;
        if (!string.IsNullOrEmpty(normType) && normRule == normType) return true;
        if (!string.IsNullOrEmpty(normDesc) && normRule == normDesc && variant.Type == ServiceVariantType.NA) return true;

        if (trimmed.Contains('('))
        {
            var parenMatch = Regex.Match(trimmed, @"\(([^()]+)\)\s*$");
            var parenNorm = parenMatch.Success ? NormalizeAlphaNum(parenMatch.Groups[1].Value) : string.Empty;
            var baseNorm = NormalizeAlphaNum(Regex.Replace(trimmed, @"\([^()]*\)\s*$", string.Empty));

            bool baseMatches = baseNorm.Length >= 3 && !string.IsNullOrEmpty(normDesc) &&
                (normDesc == baseNorm || normDesc.Contains(baseNorm, StringComparison.Ordinal) || baseNorm.Contains(normDesc, StringComparison.Ordinal));
            bool typeMatches = (string.IsNullOrEmpty(normType) && (parenNorm == "na" || string.IsNullOrEmpty(parenNorm))) ||
                (!string.IsNullOrEmpty(normType) && parenNorm == normType);

            if (baseMatches && typeMatches) return true;
        }
        else if (normRule.Length >= 4 && !string.IsNullOrEmpty(normDesc) && normRule == normDesc)
        {
            return true;
        }

        return false;
    }

    public static bool IsConditionApplicableToVariant(string? visibilityCondition, ServiceVariant variant)
    {
        if (string.IsNullOrWhiteSpace(visibilityCondition)) return true;
        var trimmed = visibilityCondition.Trim();
        if (!trimmed.StartsWith("{", StringComparison.Ordinal)) return true;

        try
        {
            using var doc = JsonDocument.Parse(trimmed);
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object) return true;

            var excluded = ReadStringList(root, "excludedVariants");
            if (excluded.Any(tok => string.Equals(tok, "ALL", StringComparison.OrdinalIgnoreCase) || VariantRuleMatchesVariant(tok, variant)))
            {
                return false;
            }

            var variants = ReadStringList(root, "variants");
            variants.AddRange(ReadStringList(root, "variantType"));
            var appTypes = ReadStringList(root, "applicationTypes");
            appTypes.AddRange(ReadStringList(root, "variantDescription"));

            if (variants.Count == 0 && appTypes.Count == 0) return true;

            if (variants.Count > 0 && variants.All(v => string.Equals(v, "__NONE__", StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            bool matchesVar = variants.Count == 0 || variants.Any(tok => VariantRuleMatchesVariant(tok, variant));
            bool matchesApp = appTypes.Count == 0 || appTypes.Any(tok => VariantRuleMatchesVariant(tok, variant));

            return variants.Count > 0 && appTypes.Count > 0
                ? (matchesVar || matchesApp)
                : (variants.Count > 0 ? matchesVar : matchesApp);
        }
        catch
        {
            return true;
        }
    }

    private static List<string> ReadStringList(JsonElement obj, string propName)
    {
        var list = new List<string>();
        if (!obj.TryGetProperty(propName, out var el)) return list;
        if (el.ValueKind == JsonValueKind.String)
        {
            var s = el.GetString()?.Trim();
            if (!string.IsNullOrEmpty(s)) list.Add(s);
        }
        else if (el.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in el.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.String)
                {
                    var s = item.GetString()?.Trim();
                    if (!string.IsNullOrEmpty(s)) list.Add(s);
                }
            }
        }
        return list;
    }

    public Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default) =>
        GetFormByServiceIdAsync(serviceId, null, null, cancellationToken);

    public async Task<Form?> GetFormByServiceIdAsync(
        Guid serviceId,
        Guid? serviceVariantId,
        string? formKey = null,
        CancellationToken cancellationToken = default)
    {
        var groupIds = GetCanonicalServiceGroupIds(serviceId);
        var canonicalId = ResolveCanonicalServiceId(serviceId);

        var allServiceForms = await _context.Forms
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AsSplitQuery()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .Where(f => groupIds.Contains(f.ServiceId) && !f.IsDeleted)
            .ToListAsync(cancellationToken);

        if (allServiceForms.Count == 0)
        {
            return null;
        }

        Form? selectedForm = null;

        // 1. Explicit formKey: strictly prioritize IsActive == true first
        if (!string.IsNullOrWhiteSpace(formKey))
        {
            selectedForm = allServiceForms
                .Where(f => string.Equals(f.Key, formKey.Trim(), StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(f => f.IsActive)
                .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .FirstOrDefault();
        }

        // 2. Specific serviceVariantId: ONLY select an ACTIVE customized variant form.
        // If no active variant form exists (e.g. reverted or inactive draft), fall back to the Active Base Form.
        if (selectedForm == null && serviceVariantId.HasValue && serviceVariantId.Value != Guid.Empty)
        {
            selectedForm = allServiceForms
                .Where(f => f.ServiceVariantId == serviceVariantId.Value && f.IsActive)
                .OrderByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .FirstOrDefault();
        }

        // 3. Fallback to the single Active Base Form (ServiceVariantId == null && BaseFormId == null)
        // Strictly prioritize f.IsActive BEFORE LastModifiedAt so inactive Draft versions never leak to clients!
        if (selectedForm == null)
        {
            selectedForm = allServiceForms
                .Where(f => f.ServiceVariantId == null && f.BaseFormId == null)
                .OrderByDescending(f => f.IsActive)
                .ThenByDescending(f => f.ServiceId == serviceId)
                .ThenByDescending(f => f.ServiceId == canonicalId)
                .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .FirstOrDefault();
        }

        // 4. Final fallback to any non-variant base form if legacy rows had BaseFormId set
        selectedForm ??= allServiceForms
            .Where(f => f.ServiceVariantId == null)
            .OrderByDescending(f => f.IsActive)
            .ThenByDescending(f => f.ServiceId == serviceId)
            .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
            .FirstOrDefault()
            ?? allServiceForms
                .OrderByDescending(f => f.IsActive)
                .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .FirstOrDefault();

        if (selectedForm != null)
        {
            if (!selectedForm.ServiceVariantId.HasValue && (!serviceVariantId.HasValue || serviceVariantId.Value == Guid.Empty))
            {
                EnsureBaseFormSupersetInMemory(selectedForm, allServiceForms);
            }

            DeduplicateFormSectionsAndFieldsInMemory(selectedForm);

            if (!selectedForm.ServiceVariantId.HasValue && serviceVariantId.HasValue && serviceVariantId.Value != Guid.Empty)
            {
                var targetVariant = await _context.ServiceVariants
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.Id == serviceVariantId.Value, cancellationToken);
                if (targetVariant != null)
                {
                    ApplyVariantProjectionInMemory(selectedForm, targetVariant);
                }
            }
        }

        return selectedForm;
    }

    private static void DeduplicateFormSectionsAndFieldsInMemory(Form form)
    {
        if (form.Sections == null || form.Sections.Count == 0) return;

        var uniqueSections = new List<FormSection>();
        var sectionsByKey = new Dictionary<string, FormSection>(StringComparer.OrdinalIgnoreCase);
        var sectionsByNormTitle = new Dictionary<string, FormSection>(StringComparer.OrdinalIgnoreCase);

        foreach (var sec in form.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
        {
            var secKey = (sec.Key ?? string.Empty).Trim();
            var normTitle = NormalizeAlphaNum(sec.Title);

            FormSection? existingSec = null;
            if (!string.IsNullOrEmpty(secKey) && sectionsByKey.TryGetValue(secKey, out var byKey))
            {
                existingSec = byKey;
            }
            else if (!string.IsNullOrEmpty(normTitle) && sectionsByNormTitle.TryGetValue(normTitle, out var byTitle))
            {
                existingSec = byTitle;
            }

            if (existingSec != null)
            {
                if (sec.SectionFields != null && existingSec.SectionFields != null)
                {
                    int nextOrder = existingSec.SectionFields.Count > 0
                        ? existingSec.SectionFields.Max(x => x.OrderIndex) + 1
                        : 0;
                    foreach (var sf in sec.SectionFields.OrderBy(x => x.OrderIndex))
                    {
                        sf.OrderIndex = nextOrder++;
                        existingSec.SectionFields.Add(sf);
                    }
                }
                continue;
            }

            uniqueSections.Add(sec);
            if (!string.IsNullOrEmpty(secKey)) sectionsByKey[secKey] = sec;
            if (!string.IsNullOrEmpty(normTitle)) sectionsByNormTitle[normTitle] = sec;
        }

        var seenFieldIdsAcrossForm = new HashSet<Guid>();
        var nonEmptySections = new List<FormSection>();

        for (int sIdx = 0; sIdx < uniqueSections.Count; sIdx++)
        {
            var sec = uniqueSections[sIdx];
            if (sec.SectionFields == null || sec.SectionFields.Count == 0)
            {
                sec.OrderIndex = nonEmptySections.Count;
                nonEmptySections.Add(sec);
                continue;
            }

            int rawFieldCount = sec.SectionFields.Count;
            var seenFieldIds = new HashSet<Guid>();
            var seenLabelTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var cleanFields = new List<SectionField>();

            // Prefer canonical deterministic fd000000-... FieldIds if duplicate Label+Type exists
            var canonicalLabelMap = new Dictionary<string, SectionField>(StringComparer.OrdinalIgnoreCase);
            foreach (var sf in sec.SectionFields)
            {
                if (sf.Field != null &&
                    !string.Equals(sf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase) &&
                    sf.FieldId.ToString().StartsWith("fd000000-", StringComparison.OrdinalIgnoreCase))
                {
                    var lKey = $"{NormalizeAlphaNum(sf.Field.Label)}::{(sf.Field.FieldType ?? "text").Trim().ToLowerInvariant()}";
                    if (!canonicalLabelMap.ContainsKey(lKey))
                    {
                        canonicalLabelMap[lKey] = sf;
                    }
                }
            }

            int fIdx = 0;
            foreach (var rawSf in sec.SectionFields.OrderBy(x => x.OrderIndex))
            {
                var sf = rawSf;
                bool isDivider = sf.Field != null && string.Equals(sf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase);
                bool isCanonicalFieldId = sf.FieldId.ToString().StartsWith("fd000000-", StringComparison.OrdinalIgnoreCase);
                if (sf.Field != null && !isDivider)
                {
                    var normLbl = NormalizeAlphaNum(sf.Field.Label);
                    var normType = (sf.Field.FieldType ?? "text").Trim().ToLowerInvariant();
                    if (!string.IsNullOrEmpty(normLbl))
                    {
                        var lKey = $"{normLbl}::{normType}";
                        if (!isCanonicalFieldId && canonicalLabelMap.TryGetValue(lKey, out var canonicalSf))
                        {
                            sf = canonicalSf;
                            isCanonicalFieldId = true;
                        }
                        // Two distinct canonical fd000000-... fields (e.g. targetPermitType and targetCertificateType in NTC_1_21)
                        // are distinct pool fields even if they share a short display label ("Type").
                        if (!isCanonicalFieldId && !seenLabelTypes.Add(lKey))
                        {
                            continue;
                        }
                        seenLabelTypes.Add(lKey);
                    }
                }

                if (sf.FieldId != Guid.Empty && !seenFieldIds.Add(sf.FieldId))
                {
                    continue;
                }

                if (!isDivider && sf.FieldId != Guid.Empty && !seenFieldIdsAcrossForm.Add(sf.FieldId))
                {
                    continue;
                }

                sf.OrderIndex = fIdx++;
                cleanFields.Add(sf);
            }

            sec.SectionFields = cleanFields;

            // If a section originally had fields and all of its non-divider fields were duplicates already present in an earlier section, omit it
            bool hasNonDivider = cleanFields.Any(cf => cf.Field == null || !string.Equals(cf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase));
            if (rawFieldCount > 0 && (cleanFields.Count == 0 || !hasNonDivider))
            {
                continue;
            }

            sec.OrderIndex = nonEmptySections.Count;
            nonEmptySections.Add(sec);
        }

        form.Sections = nonEmptySections;
    }

    private static void ApplyVariantProjectionInMemory(Form form, ServiceVariant variant)
    {
        if (form.Sections == null) return;
        var projectedSections = new List<FormSection>();

        foreach (var sec in form.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
        {
            var secVis = FormSectionDto.ExtractSectionVisibilityCondition(sec.SectionFields);
            if (!IsConditionApplicableToVariant(secVis, variant))
            {
                continue;
            }

            if (sec.SectionFields != null)
            {
                // Apply sectionVariantTitles if configured on any field in section
                foreach (var sf in sec.SectionFields)
                {
                    var customSecTitle = TryExtractVariantSectionTitle(sf.Field?.ValidationRules, variant);
                    if (!string.IsNullOrWhiteSpace(customSecTitle))
                    {
                        sec.Title = customSecTitle!;
                        break;
                    }
                }

                var rawCount = sec.SectionFields.Count;
                var applicableSfs = sec.SectionFields
                    .OrderBy(sf => sf.OrderIndex)
                    .Where(sf => IsConditionApplicableToVariant(sf.VisibilityCondition, variant))
                    .ToList();

                if (rawCount > 0 && applicableSfs.Count == 0)
                {
                    continue;
                }

                int fIdx = 0;
                foreach (var sf in applicableSfs)
                {
                    sf.OrderIndex = fIdx++;
                    if (sf.Field != null)
                    {
                        ApplyVariantFieldOverrideInMemory(sf, variant);
                    }
                }

                sec.SectionFields = applicableSfs;
            }

            sec.OrderIndex = projectedSections.Count;
            projectedSections.Add(sec);
        }

        form.Sections = projectedSections;
    }

    private static string? TryExtractVariantSectionTitle(string? validationRules, ServiceVariant variant)
    {
        if (string.IsNullOrWhiteSpace(validationRules)) return null;
        var trimmed = validationRules.Trim();
        if (!trimmed.StartsWith("{", StringComparison.Ordinal)) return null;
        try
        {
            using var doc = JsonDocument.Parse(trimmed);
            if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                doc.RootElement.TryGetProperty("sectionVariantTitles", out var titlesEl) &&
                titlesEl.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in titlesEl.EnumerateObject())
                {
                    if (VariantRuleMatchesVariant(prop.Name, variant) && prop.Value.ValueKind == JsonValueKind.String)
                    {
                        var val = prop.Value.GetString();
                        if (!string.IsNullOrWhiteSpace(val)) return val;
                    }
                }
            }
        }
        catch { /* ignore */ }
        return null;
    }

    private static void ApplyVariantFieldOverrideInMemory(SectionField sf, ServiceVariant variant)
    {
        var rules = sf.Field?.ValidationRules;
        if (string.IsNullOrWhiteSpace(rules) || sf.Field == null) return;
        var trimmed = rules.Trim();
        if (!trimmed.StartsWith("{", StringComparison.Ordinal)) return;

        try
        {
            using var doc = JsonDocument.Parse(trimmed);
            if (doc.RootElement.ValueKind != JsonValueKind.Object) return;
            if (!doc.RootElement.TryGetProperty("variantOverrides", out var overridesEl) ||
                overridesEl.ValueKind != JsonValueKind.Object)
            {
                return;
            }

            foreach (var prop in overridesEl.EnumerateObject())
            {
                if (!VariantRuleMatchesVariant(prop.Name, variant) || prop.Value.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                var ov = prop.Value;
                if (ov.TryGetProperty("required", out var reqEl) &&
                    (reqEl.ValueKind == JsonValueKind.True || reqEl.ValueKind == JsonValueKind.False))
                {
                    sf.IsRequired = reqEl.GetBoolean();
                }

                // Clone detached Field instance for DTO projection so EF tracked entity is never mutated
                var projectedLabel = ov.TryGetProperty("label", out var lblEl) && lblEl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(lblEl.GetString())
                    ? lblEl.GetString()!
                    : sf.Field.Label;

                var updatedNode = JsonNode.Parse(trimmed) as JsonObject;
                if (updatedNode != null)
                {
                    if (ov.TryGetProperty("placeholder", out var phEl) && phEl.ValueKind == JsonValueKind.String)
                        updatedNode["placeholder"] = phEl.GetString();
                    if (ov.TryGetProperty("helpText", out var htEl) && htEl.ValueKind == JsonValueKind.String)
                        updatedNode["helpText"] = htEl.GetString();
                    if (ov.TryGetProperty("options", out var optEl) && optEl.ValueKind == JsonValueKind.Array)
                        updatedNode["options"] = JsonNode.Parse(optEl.GetRawText());
                }

                sf.Field = new Field
                {
                    Id = sf.Field.Id,
                    Label = projectedLabel,
                    FieldType = sf.Field.FieldType,
                    ValidationRules = updatedNode != null ? updatedNode.ToJsonString() : sf.Field.ValidationRules,
                    IsOtherEnabled = sf.Field.IsOtherEnabled,
                    SyncBackOnSubmit = sf.Field.SyncBackOnSubmit
                };
                break;
            }
        }
        catch { /* ignore */ }
    }

    /// <summary>
    /// Ensures that when a Base Form ("All Sections & Fields") is loaded, any sections or fields
    /// that exist in active customized Service Variant forms are rolled up into the Base Form view
    /// scoped to their respective Service Variant(s).
    /// </summary>
    private static void EnsureBaseFormSupersetInMemory(Form baseForm, IReadOnlyList<Form> siblingForms)
    {
        if (baseForm.Sections == null || siblingForms.Count == 0) return;
        if (!baseForm.IsActive) return;

        var activeVariantForms = siblingForms
            .Where(f => f.Id != baseForm.Id && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted && f.Sections != null)
            .ToList();

        if (activeVariantForms.Count == 0) return;

        var existingFieldIds = baseForm.Sections
            .Where(s => !s.IsDeleted && s.SectionFields != null)
            .SelectMany(s => s.SectionFields)
            .Select(sf => sf.FieldId)
            .ToHashSet();

        var sectionsByKey = baseForm.Sections
            .Where(s => !s.IsDeleted)
            .GroupBy(s => (s.Key ?? string.Empty).Trim(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        var sectionsByNormTitle = baseForm.Sections
            .Where(s => !s.IsDeleted && !string.IsNullOrWhiteSpace(s.Title))
            .GroupBy(s => NormalizeAlphaNum(s.Title), StringComparer.OrdinalIgnoreCase)
            .Where(g => !string.IsNullOrEmpty(g.Key))
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        int maxSecOrder = baseForm.Sections.Count > 0 ? baseForm.Sections.Max(s => s.OrderIndex) : 0;

        foreach (var vf in activeVariantForms)
        {
            var variantLabel = vf.ServiceVariant != null
                ? FormatVariantDisplayName(vf.ServiceVariant)
                : (!string.IsNullOrWhiteSpace(vf.Name) ? vf.Name! : $"var_{vf.ServiceVariantId}");
            var variantIdStr = vf.ServiceVariantId!.Value.ToString();

            foreach (var vSec in vf.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
            {
                var secKey = (vSec.Key ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(secKey)) secKey = "general";
                var normSecTitle = NormalizeAlphaNum(vSec.Title);

                if (!sectionsByKey.TryGetValue(secKey, out var targetSec) &&
                    (string.IsNullOrEmpty(normSecTitle) || !sectionsByNormTitle.TryGetValue(normSecTitle, out targetSec)))
                {
                    targetSec = new FormSection
                    {
                        Id = vSec.Id,
                        FormId = baseForm.Id,
                        Key = secKey,
                        Title = vSec.Title,
                        OrderIndex = ++maxSecOrder,
                        SectionFields = new List<SectionField>()
                    };
                    baseForm.Sections.Add(targetSec);
                    sectionsByKey[secKey] = targetSec;
                    if (!string.IsNullOrEmpty(normSecTitle))
                    {
                        sectionsByNormTitle[normSecTitle] = targetSec;
                    }
                }

                var existingLabelsInTargetSec = targetSec.SectionFields
                    .Where(sf => sf.Field != null && !string.Equals(sf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase))
                    .Select(sf => $"{NormalizeAlphaNum(sf.Field!.Label)}::{(sf.Field.FieldType ?? "text").Trim().ToLowerInvariant()}")
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                int nextFieldOrder = targetSec.SectionFields.Count > 0
                    ? targetSec.SectionFields.Max(sf => sf.OrderIndex) + 1
                    : 0;

                foreach (var vsf in (vSec.SectionFields ?? Enumerable.Empty<SectionField>()).OrderBy(x => x.OrderIndex))
                {
                    if (vsf.FieldId == Guid.Empty || existingFieldIds.Contains(vsf.FieldId))
                    {
                        continue;
                    }

                    if (vsf.Field != null && !string.Equals(vsf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase))
                    {
                        var lKey = $"{NormalizeAlphaNum(vsf.Field.Label)}::{(vsf.Field.FieldType ?? "text").Trim().ToLowerInvariant()}";
                        if (!string.IsNullOrEmpty(NormalizeAlphaNum(vsf.Field.Label)) && !existingLabelsInTargetSec.Add(lKey))
                        {
                            continue;
                        }
                    }

                    existingFieldIds.Add(vsf.FieldId);
                    var scopedCond = UpsertVariantInclusionInCondition(vsf.VisibilityCondition, variantLabel, variantIdStr);
                    targetSec.SectionFields.Add(new SectionField
                    {
                        FormSectionId = targetSec.Id,
                        FieldId = vsf.FieldId,
                        Field = vsf.Field,
                        IsRequired = vsf.IsRequired,
                        OrderIndex = nextFieldOrder++,
                        VisibilityCondition = scopedCond
                    });
                }
            }
        }
    }

    public async Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .AsSplitQuery()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted, cancellationToken);

        if (form != null)
        {
            if (form.ServiceId != Guid.Empty && !form.ServiceVariantId.HasValue && form.IsActive)
            {
                var groupIds = GetCanonicalServiceGroupIds(form.ServiceId);
                var siblingForms = await _context.Forms
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Include(f => f.ServiceVariant)
                    .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                        .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                            .ThenInclude(sf => sf.Field)
                    .Where(f => groupIds.Contains(f.ServiceId) && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted)
                    .ToListAsync(cancellationToken);

                EnsureBaseFormSupersetInMemory(form, siblingForms);
            }

            DeduplicateFormSectionsAndFieldsInMemory(form);
        }

        return form;
    }

    public async Task<List<Form>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var forms = await _context.Forms
            .AsNoTracking()
            .AsSplitQuery()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);

        var activeBaseForms = forms.Where(f => !f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted).ToList();
        foreach (var bf in activeBaseForms)
        {
            var groupIds = GetCanonicalServiceGroupIds(bf.ServiceId);
            var siblings = forms.Where(f => groupIds.Contains(f.ServiceId)).ToList();
            EnsureBaseFormSupersetInMemory(bf, siblings);
        }

        foreach (var f in forms)
        {
            DeduplicateFormSectionsAndFieldsInMemory(f);
        }

        return forms;
    }

    public async Task<Dictionary<Guid, (int LinkedVariantsCount, List<Guid> CustomizedVariantIds)>> GetBatchVariantMetadataForServicesAsync(
        IEnumerable<Guid> serviceIds,
        CancellationToken cancellationToken = default)
    {
        var distinctServiceIds = serviceIds.Where(id => id != Guid.Empty).Distinct().ToList();
        var result = new Dictionary<Guid, (int LinkedVariantsCount, List<Guid> CustomizedVariantIds)>();
        if (distinctServiceIds.Count == 0)
        {
            return result;
        }

        var groupMap = new Dictionary<Guid, IReadOnlyCollection<Guid>>();
        var allGroupIds = new HashSet<Guid>();
        foreach (var svcId in distinctServiceIds)
        {
            var gIds = GetCanonicalServiceGroupIds(svcId);
            groupMap[svcId] = gIds;
            foreach (var gId in gIds)
            {
                if (gId != Guid.Empty) allGroupIds.Add(gId);
            }
        }

        var variantCountsByService = await _context.ServiceVariants
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(v => allGroupIds.Contains(v.ServiceId) && !v.IsDeleted)
            .GroupBy(v => v.ServiceId)
            .Select(g => new { ServiceId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ServiceId, x => x.Count, cancellationToken);

        var activeCustomizedVariants = await _context.Forms
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(f => allGroupIds.Contains(f.ServiceId) && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted)
            .Select(f => new { f.ServiceId, VariantId = f.ServiceVariantId!.Value })
            .ToListAsync(cancellationToken);

        foreach (var svcId in distinctServiceIds)
        {
            var gIds = groupMap[svcId];
            int totalVariants = gIds.Sum(id => variantCountsByService.TryGetValue(id, out var c) ? c : 0);
            var customVarIds = activeCustomizedVariants
                .Where(x => gIds.Contains(x.ServiceId))
                .Select(x => x.VariantId)
                .Distinct()
                .ToList();

            result[svcId] = (totalVariants, customVarIds);
        }

        return result;
    }

    public async Task<(List<FormSummaryDto> Items, int TotalCount)> GetFormSummariesAsync(
        int pageNumber = 1,
        int pageSize = 50,
        string? searchTerm = null,
        Guid? serviceId = null,
        string? formKey = null,
        Guid? serviceCategoryId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Forms
            .AsNoTracking()
            .Where(f => !f.IsDeleted && (!f.ServiceVariantId.HasValue || f.ServiceVariantId == Guid.Empty));

        if (serviceId.HasValue && serviceId.Value != Guid.Empty)
        {
            var groupIds = GetCanonicalServiceGroupIds(serviceId.Value);
            query = query.Where(f => groupIds.Contains(f.ServiceId));
        }

        if (serviceCategoryId.HasValue && serviceCategoryId.Value != Guid.Empty)
        {
            var catId = serviceCategoryId.Value;
            // Also match canonical base forms whose sub-services belong to this category
            var categoryServiceIds = await _context.Services
                .AsNoTracking()
                .Where(s => s.ServiceCategoryId == catId)
                .Select(s => s.Id)
                .ToListAsync(cancellationToken);

            var expandedServiceIds = new HashSet<Guid>(categoryServiceIds);
            foreach (var sId in categoryServiceIds)
            {
                var canonical = ResolveCanonicalServiceId(sId);
                if (canonical != Guid.Empty) expandedServiceIds.Add(canonical);
            }

            query = query.Where(f =>
                (f.Service != null && f.Service.ServiceCategoryId == catId) ||
                expandedServiceIds.Contains(f.ServiceId));
        }

        if (!string.IsNullOrWhiteSpace(formKey))
        {
            var targetKey = formKey.Trim().ToLower();
            query = query.Where(f => f.Key != null && f.Key.ToLower() == targetKey);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            query = query.Where(f =>
                (f.Name != null && f.Name.ToLower().Contains(search)) ||
                (f.Key != null && f.Key.ToLower().Contains(search)) ||
                (f.Version != null && f.Version.ToLower().Contains(search)) ||
                (f.Service != null && f.Service.Name != null && f.Service.Name.ToLower().Contains(search)) ||
                (f.Service != null && f.Service.Code != null && f.Service.Code.ToLower().Contains(search)) ||
                f.Sections.Any(s => !s.IsDeleted && (
                    (s.Title != null && s.Title.ToLower().Contains(search)) ||
                    (s.Key != null && s.Key.ToLower().Contains(search)) ||
                    s.SectionFields.Any(sf => sf.Field != null && sf.Field.Label != null && sf.Field.Label.ToLower().Contains(search))
                )));
        }

        var lightweightRows = await query
            .Select(f => new
            {
                f.Id,
                f.Key,
                f.ServiceId,
                ServiceCategoryId = f.Service != null ? (Guid?)f.Service.ServiceCategoryId : null,
                ServiceName = f.Service != null ? f.Service.Name : null,
                ServiceCode = f.Service != null ? f.Service.Code : null,
                f.Name,
                f.Version,
                f.IsActive,
                f.CategorySelectionRequired,
                f.CreatedAt,
                f.LastModifiedAt,
                SectionsCount = f.Sections.Count(s => !s.IsDeleted),
                FieldsCount = f.Sections.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields).Count()
            })
            .ToListAsync(cancellationToken);

        var grouped = lightweightRows
            .GroupBy(r => r.ServiceId != Guid.Empty ? $"{r.ServiceId}:base" : r.Id.ToString())
            .Select(g =>
            {
                var allInGroup = g.OrderByDescending(x => x.IsActive).ThenByDescending(x => x.CreatedAt).ToList();
                var primary = allInGroup.FirstOrDefault(x => x.IsActive) ?? allInGroup.First();

                bool seenActive = false;
                var versions = allInGroup.Select(v =>
                {
                    bool effectiveActive = v.IsActive && !seenActive;
                    if (effectiveActive) seenActive = true;
                    return new FormVersionSummaryDto
                    {
                        FormId = v.Id,
                        Key = v.Key,
                        ServiceVariantId = null,
                        Version = v.Version,
                        Name = v.Name,
                        IsActive = effectiveActive,
                        CreatedAt = v.CreatedAt,
                        UpdatedAt = v.LastModifiedAt,
                        SectionsCount = v.SectionsCount,
                        FieldsCount = v.FieldsCount
                    };
                }).ToList();

                return new FormSummaryDto
                {
                    FormId = primary.Id,
                    Key = primary.Key,
                    ServiceId = primary.ServiceId,
                    ServiceCategoryId = primary.ServiceCategoryId,
                    ServiceName = primary.ServiceName,
                    ServiceCode = primary.ServiceCode,
                    Name = primary.Name,
                    Version = primary.Version,
                    IsActive = primary.IsActive,
                    CategorySelectionRequired = primary.CategorySelectionRequired,
                    CreatedAt = primary.CreatedAt,
                    UpdatedAt = primary.LastModifiedAt,
                    AvailableVersions = versions
                };
            })
            .OrderByDescending(f => f.UpdatedAt ?? f.CreatedAt)
            .ToList();

        if (isActive.HasValue)
        {
            grouped = grouped.Where(f => f.IsActive == isActive.Value).ToList();
        }

        int totalCount = grouped.Count;
        int validPage = pageNumber <= 0 ? 1 : pageNumber;
        int validSize = pageSize <= 0 ? 50 : pageSize;

        var paginated = grouped
            .Skip((validPage - 1) * validSize)
            .Take(validSize)
            .ToList();

        var pageServiceIds = paginated
            .Where(i => i.ServiceId != Guid.Empty)
            .Select(i => i.ServiceId)
            .Distinct()
            .ToList();

        if (pageServiceIds.Count > 0)
        {
            var batchMeta = await GetBatchVariantMetadataForServicesAsync(pageServiceIds, cancellationToken);
            foreach (var item in paginated)
            {
                if (item.ServiceId != Guid.Empty && batchMeta.TryGetValue(item.ServiceId, out var meta))
                {
                    item.LinkedVariantsCount = meta.LinkedVariantsCount;
                    item.CustomizedVariantIds = meta.CustomizedVariantIds;
                }
            }
        }

        return (paginated, totalCount);
    }

    public async Task<FormFilterOptionsDto> GetFormFilterOptionsAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _context.ServiceCategories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new FormCategoryOptionDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                Type = c.Type.ToString()
            })
            .ToListAsync(cancellationToken);

        var services = await _context.Services
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new FormServiceOptionDto
            {
                Id = s.Id,
                ServiceCategoryId = s.ServiceCategoryId,
                ServiceCategoryCode = s.ServiceCategory != null && s.ServiceCategory.Code != null ? s.ServiceCategory.Code : string.Empty,
                ServiceCategoryType = s.ServiceCategory != null ? s.ServiceCategory.Type.ToString() : string.Empty,
                Name = s.Name,
                Group = s.Group,
                Code = s.Code
            })
            .ToListAsync(cancellationToken);

        return new FormFilterOptionsDto
        {
            Categories = categories,
            Services = services
        };
    }

    public async Task<(Form? Form, List<FormVersionSummaryDto> Versions, List<Guid> CustomizedVariantIds, List<FormServiceOptionDto> LinkedServices, List<ServiceVariantDto> ServiceVariants)> GetFormWorkspaceDataAsync(
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AsSplitQuery()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == formId && !f.IsDeleted, cancellationToken);

        if (form == null)
        {
            return (null, new List<FormVersionSummaryDto>(), new List<Guid>(), new List<FormServiceOptionDto>(), new List<ServiceVariantDto>());
        }

        var targetServiceIds = new HashSet<Guid>();
        if (form.ServiceId != Guid.Empty)
        {
            foreach (var gId in GetCanonicalServiceGroupIds(form.ServiceId))
            {
                if (gId != Guid.Empty) targetServiceIds.Add(gId);
            }
        }

        // Also include any explicitly linkedServices stored in formMetadata on first field's ValidationRules
        var firstFieldRules = form.Sections
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.OrderIndex)
            .SelectMany(s => s.SectionFields.OrderBy(sf => sf.OrderIndex))
            .Select(sf => sf.Field != null ? sf.Field.ValidationRules : null)
            .FirstOrDefault(r => !string.IsNullOrWhiteSpace(r));

        if (!string.IsNullOrWhiteSpace(firstFieldRules) && firstFieldRules.Trim().StartsWith("{", StringComparison.Ordinal))
        {
            try
            {
                using var doc = JsonDocument.Parse(firstFieldRules.Trim());
                if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                    doc.RootElement.TryGetProperty("formMetadata", out var metaEl) &&
                    metaEl.ValueKind == JsonValueKind.Object &&
                    metaEl.TryGetProperty("linkedServices", out var lsEl) &&
                    lsEl.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in lsEl.EnumerateArray())
                    {
                        if (item.ValueKind == JsonValueKind.Object &&
                            item.TryGetProperty("id", out var idEl) &&
                            idEl.ValueKind == JsonValueKind.String &&
                            Guid.TryParse(idEl.GetString(), out var extraSvcId) &&
                            extraSvcId != Guid.Empty)
                        {
                            targetServiceIds.Add(extraSvcId);
                        }
                    }
                }
            }
            catch
            {
                // ignore malformed metadata
            }
        }

        if (!form.ServiceVariantId.HasValue && form.IsActive && targetServiceIds.Count > 0)
        {
            var activeVariantSiblings = await _context.Forms
                .IgnoreQueryFilters()
                .AsNoTracking()
                .AsSplitQuery()
                .Include(f => f.ServiceVariant)
                .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                    .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                        .ThenInclude(sf => sf.Field)
                .Where(f => targetServiceIds.Contains(f.ServiceId) && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted)
                .ToListAsync(cancellationToken);

            EnsureBaseFormSupersetInMemory(form, activeVariantSiblings);
        }

        DeduplicateFormSectionsAndFieldsInMemory(form);

        var versions = new List<FormVersionSummaryDto>();
        var customizedVariantIds = new List<Guid>();
        var linkedServices = new List<FormServiceOptionDto>();
        var serviceVariants = new List<ServiceVariantDto>();

        if (targetServiceIds.Count > 0)
        {
            var rawVersions = await _context.Forms
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(f => targetServiceIds.Contains(f.ServiceId) && f.ServiceVariantId == form.ServiceVariantId && !f.IsDeleted)
                .OrderByDescending(f => f.IsActive)
                .ThenByDescending(f => f.CreatedAt)
                .Select(v => new
                {
                    v.Id,
                    v.Key,
                    v.ServiceVariantId,
                    v.Version,
                    v.Name,
                    v.IsActive,
                    v.CreatedAt,
                    v.LastModifiedAt,
                    SectionsCount = v.Sections.Count(s => !s.IsDeleted),
                    FieldsCount = v.Sections.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields).Count()
                })
                .ToListAsync(cancellationToken);

            bool seenActive = false;
            versions = rawVersions.Select(v =>
            {
                bool effectiveActive = v.IsActive && !seenActive;
                if (effectiveActive) seenActive = true;
                return new FormVersionSummaryDto
                {
                    FormId = v.Id,
                    Key = v.Key,
                    ServiceVariantId = v.ServiceVariantId,
                    Version = v.Version,
                    Name = v.Name,
                    IsActive = effectiveActive,
                    CreatedAt = v.CreatedAt,
                    UpdatedAt = v.LastModifiedAt,
                    SectionsCount = v.SectionsCount,
                    FieldsCount = v.FieldsCount
                };
            }).ToList();

            customizedVariantIds = await _context.Forms
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(f => targetServiceIds.Contains(f.ServiceId) && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted)
                .Select(f => f.ServiceVariantId!.Value)
                .Distinct()
                .ToListAsync(cancellationToken);

            linkedServices = await _context.Services
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(s => targetServiceIds.Contains(s.Id) && !s.IsDeleted)
                .OrderBy(s => s.Name)
                .Select(s => new FormServiceOptionDto
                {
                    Id = s.Id,
                    ServiceCategoryId = s.ServiceCategoryId,
                    ServiceCategoryCode = s.ServiceCategory != null && s.ServiceCategory.Code != null ? s.ServiceCategory.Code : string.Empty,
                    ServiceCategoryType = s.ServiceCategory != null ? s.ServiceCategory.Type.ToString() : string.Empty,
                    Name = s.Name,
                    Group = s.Group,
                    Code = s.Code
                })
                .ToListAsync(cancellationToken);

            serviceVariants = await _context.ServiceVariants
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(v => targetServiceIds.Contains(v.ServiceId) && !v.IsDeleted)
                .OrderBy(v => v.Service != null ? v.Service.Name : string.Empty)
                .ThenBy(v => v.Type)
                .ThenBy(v => v.Description ?? string.Empty)
                .Select(v => new ServiceVariantDto
                {
                    Id = v.Id,
                    ServiceId = v.ServiceId,
                    ServiceName = v.Service != null ? v.Service.Name : null,
                    ServiceCode = v.Service != null ? v.Service.Code : null,
                    Type = v.Type.ToString(),
                    Description = v.Description,
                    IsIndividual = v.IsIndividual
                })
                .ToListAsync(cancellationToken);
        }

        return (form, versions, customizedVariantIds, linkedServices, serviceVariants);
    }

    public async Task<List<Guid>> GetCustomizedVariantIdsForServiceGroupAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        if (serviceId == Guid.Empty) return new List<Guid>();
        var groupIds = GetCanonicalServiceGroupIds(serviceId);
        return await _context.Forms
            .IgnoreQueryFilters()
            .Where(f => groupIds.Contains(f.ServiceId) && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted)
            .Select(f => f.ServiceVariantId!.Value)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetLinkedVariantsCountForServiceGroupAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        if (serviceId == Guid.Empty) return 0;
        var groupIds = GetCanonicalServiceGroupIds(serviceId);
        return await _context.ServiceVariants
            .IgnoreQueryFilters()
            .CountAsync(v => groupIds.Contains(v.ServiceId) && !v.IsDeleted, cancellationToken);
    }

    public async Task<string?> ValidateCanDeleteFormAsync(Form form, CancellationToken cancellationToken = default)
    {
        bool hasSubmissions = await _context.FormSubmissions
            .IgnoreQueryFilters()
            .AnyAsync(fs => fs.FormId == form.Id && !fs.IsDeleted, cancellationToken);

        if (hasSubmissions)
        {
            return "Cannot delete this form version because client applications have already been submitted using it.";
        }

        if (!form.ServiceVariantId.HasValue && form.ServiceId != Guid.Empty)
        {
            var groupIds = GetCanonicalServiceGroupIds(form.ServiceId);
            var activeVariantsCount = await _context.ServiceVariants
                .IgnoreQueryFilters()
                .CountAsync(v => groupIds.Contains(v.ServiceId) && !v.IsDeleted, cancellationToken);

            if (activeVariantsCount > 0)
            {
                bool hasAnotherActiveBaseForm = await _context.Forms
                    .IgnoreQueryFilters()
                    .AnyAsync(f => groupIds.Contains(f.ServiceId)
                                && f.Id != form.Id
                                && f.ServiceVariantId == null
                                && !f.IsDeleted
                                && f.IsActive, cancellationToken);

                if (form.IsActive || !hasAnotherActiveBaseForm)
                {
                    return $"Cannot delete this Base Form because it is used by {activeVariantsCount} Service Variant(s). Active Base Forms serving Service Variants cannot be deleted.";
                }
            }
        }

        return null;
    }

    public async Task<string?> ValidateBaseFormDeletionsAsync(
        Guid baseFormId,
        Guid serviceId,
        List<FormSectionDto> incomingSections,
        CancellationToken cancellationToken = default)
    {
        var existingForm = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Sections.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.SectionFields)
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == baseFormId && !f.IsDeleted, cancellationToken);

        if (existingForm == null || existingForm.ServiceVariantId.HasValue)
        {
            return null;
        }

        var groupIds = GetCanonicalServiceGroupIds(serviceId != Guid.Empty ? serviceId : existingForm.ServiceId);
        var activeVariants = await _context.ServiceVariants
            .IgnoreQueryFilters()
            .Where(v => groupIds.Contains(v.ServiceId) && !v.IsDeleted)
            .ToListAsync(cancellationToken);

        if (activeVariants.Count == 0)
        {
            return null;
        }

        var customizedVariantForms = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.ServiceVariant)
            .Include(f => f.Sections.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.SectionFields)
            .Where(f => groupIds.Contains(f.ServiceId) && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted)
            .ToListAsync(cancellationToken);

        var customizedByVariantId = customizedVariantForms
            .Where(f => f.ServiceVariantId.HasValue)
            .GroupBy(f => f.ServiceVariantId!.Value)
            .ToDictionary(g => g.Key, g => g.First());

        var incomingFieldIds = (incomingSections ?? new List<FormSectionDto>())
            .SelectMany(s => s.Fields ?? new List<FormFieldDto>())
            .Where(f => f.FieldId != Guid.Empty)
            .Select(f => f.FieldId)
            .ToHashSet();

        var incomingSectionKeys = (incomingSections ?? new List<FormSectionDto>())
            .Where(s => !string.IsNullOrWhiteSpace(s.Key))
            .Select(s => s.Key.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var existingSec in existingForm.Sections.Where(s => !s.IsDeleted))
        {
            var secKey = (existingSec.Key ?? string.Empty).Trim();
            bool sectionRemoved = !string.IsNullOrEmpty(secKey) &&
                                  !string.Equals(secKey, "general", StringComparison.OrdinalIgnoreCase) &&
                                  !incomingSectionKeys.Contains(secKey);

            if (sectionRemoved)
            {
                var variantsUsingSection = new List<string>();
                foreach (var variant in activeVariants)
                {
                    bool used;
                    if (customizedByVariantId.TryGetValue(variant.Id, out var cvf))
                    {
                        used = cvf.Sections.Any(cs => !cs.IsDeleted && string.Equals((cs.Key ?? string.Empty).Trim(), secKey, StringComparison.OrdinalIgnoreCase));
                    }
                    else
                    {
                        var secVis = FormSectionDto.ExtractSectionVisibilityCondition(existingSec.SectionFields);
                        used = IsConditionApplicableToVariant(secVis, variant) &&
                               (existingSec.SectionFields.Count == 0 || existingSec.SectionFields.Any(sf => IsConditionApplicableToVariant(sf.VisibilityCondition, variant)));
                    }

                    if (used)
                    {
                        variantsUsingSection.Add(FormatVariantDisplayName(variant));
                    }
                }

                if (variantsUsingSection.Count > 0)
                {
                    var sample = string.Join(", ", variantsUsingSection.Take(4));
                    var suffix = variantsUsingSection.Count > 4 ? $" (+{variantsUsingSection.Count - 4} more)" : string.Empty;
                    return $"Cannot delete section '{existingSec.Title}' from All Sections because it is currently used by {variantsUsingSection.Count} Service Variant(s): {sample}{suffix}. Remove it from those Service Variants first.";
                }
            }

            foreach (var sf in existingSec.SectionFields)
            {
                if (sf.FieldId == Guid.Empty || incomingFieldIds.Contains(sf.FieldId))
                {
                    continue;
                }

                if (string.Equals(sf.Field?.FieldType, "divider", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var variantsUsingField = new List<string>();
                foreach (var variant in activeVariants)
                {
                    bool used;
                    if (customizedByVariantId.TryGetValue(variant.Id, out var cvf))
                    {
                        used = cvf.Sections
                            .Where(cs => !cs.IsDeleted)
                            .SelectMany(cs => cs.SectionFields)
                            .Any(csf => csf.FieldId == sf.FieldId);
                    }
                    else
                    {
                        used = IsConditionApplicableToVariant(sf.VisibilityCondition, variant);
                    }

                    if (used)
                    {
                        variantsUsingField.Add(FormatVariantDisplayName(variant));
                    }
                }

                if (variantsUsingField.Count > 0)
                {
                    var fieldLabel = !string.IsNullOrWhiteSpace(sf.Field?.Label) ? sf.Field!.Label : sf.FieldId.ToString();
                    var sample = string.Join(", ", variantsUsingField.Take(4));
                    var suffix = variantsUsingField.Count > 4 ? $" (+{variantsUsingField.Count - 4} more)" : string.Empty;
                    return $"Cannot delete field '{fieldLabel}' from All Sections because it is currently used by {variantsUsingField.Count} Service Variant(s): {sample}{suffix}. Remove it from all Service Variants first.";
                }
            }
        }

        return null;
    }

    public async Task<List<Field>> GetFieldsByIdsAsync(IEnumerable<Guid> fieldIds, CancellationToken cancellationToken = default)
    {
        var idList = fieldIds.Where(id => id != Guid.Empty).Distinct().ToList();
        if (idList.Count == 0)
        {
            return new List<Field>();
        }

        return await _context.Fields
            .IgnoreQueryFilters()
            .Where(f => idList.Contains(f.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Form form, CancellationToken cancellationToken = default)
    {
        await _context.Forms.AddAsync(form, cancellationToken);
    }

    public void Update(Form form)
    {
        var entry = _context.Entry(form);
        if (entry.State == EntityState.Detached)
        {
            _context.Forms.Update(form);
        }
    }

    public void Delete(Form form)
    {
        _context.Forms.Remove(form);
    }

    public async Task<Form> SaveFormStructureAsync(
        Guid formId,
        Guid serviceId,
        string version,
        bool categorySelectionRequired,
        List<FormSectionDto> incomingSections,
        string? name = null,
        bool? isActive = null,
        string? key = null,
        Guid? serviceVariantId = null,
        Guid? baseFormId = null,
        CancellationToken cancellationToken = default)
    {
        var groupIds = GetCanonicalServiceGroupIds(serviceId);

        // 1. Get or Create Form
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == formId, cancellationToken);

        if (form == null)
        {
            bool shouldBeActive;
            if (isActive.HasValue)
            {
                shouldBeActive = isActive.Value;
            }
            else if (serviceVariantId.HasValue && serviceVariantId.Value != Guid.Empty)
            {
                shouldBeActive = !await _context.Forms.AnyAsync(f =>
                    f.ServiceVariantId == serviceVariantId.Value &&
                    !f.IsDeleted &&
                    f.IsActive, cancellationToken);
            }
            else
            {
                shouldBeActive = !await _context.Forms.AnyAsync(f =>
                    groupIds.Contains(f.ServiceId) &&
                    f.ServiceVariantId == null &&
                    !f.IsDeleted &&
                    f.IsActive, cancellationToken);
            }

            var fallbackKey = !string.IsNullOrWhiteSpace(key)
                ? key.Trim()
                : (serviceVariantId.HasValue ? $"var_{serviceVariantId.Value}" : $"form_{formId}");

            form = new Form
            {
                Id = formId,
                ServiceId = serviceId,
                Key = fallbackKey,
                ServiceVariantId = serviceVariantId,
                BaseFormId = serviceVariantId.HasValue ? baseFormId : null,
                Name = name,
                IsActive = shouldBeActive,
                Version = string.IsNullOrWhiteSpace(version) ? "1.0" : version,
                CategorySelectionRequired = categorySelectionRequired,
                CreatedAt = DateTime.UtcNow,
                LastModifiedAt = DateTime.UtcNow
            };
            await _context.Forms.AddAsync(form, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            form.ServiceId = serviceId;
            if (!string.IsNullOrWhiteSpace(key))
            {
                form.Key = key.Trim();
            }
            if (serviceVariantId.HasValue)
            {
                form.ServiceVariantId = serviceVariantId.Value;
                if (baseFormId.HasValue)
                {
                    form.BaseFormId = baseFormId.Value;
                }
            }
            else
            {
                form.ServiceVariantId = null;
                form.BaseFormId = null;
            }
            if (!string.IsNullOrWhiteSpace(name))
            {
                form.Name = name;
            }
            if (isActive.HasValue)
            {
                form.IsActive = isActive.Value;
            }
            form.Version = string.IsNullOrWhiteSpace(version) ? "1.0" : version;
            form.CategorySelectionRequired = categorySelectionRequired;
            form.IsDeleted = false;
            form.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Enforce Strict Single-Active Version per Base Form or per Service Variant
        if (form.IsActive)
        {
            await DeactivateOtherActiveFormsInScopeAsync(form, cancellationToken);
        }

        // Determine Base Form Field IDs so saving a Variant Form never mutates shared Base Field labels globally
        var protectedBaseFieldIds = new HashSet<Guid>();
        string? activeVariantDisplayName = null;
        if (form.ServiceVariantId.HasValue && form.ServiceVariantId.Value != Guid.Empty)
        {
            var variantEntity = await _context.ServiceVariants
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == form.ServiceVariantId.Value, cancellationToken);
            activeVariantDisplayName = variantEntity != null
                ? FormatVariantDisplayName(variantEntity)
                : $"var_{form.ServiceVariantId.Value}";

            var baseFieldList = await _context.FormSections
                .IgnoreQueryFilters()
                .Where(s => !s.IsDeleted && s.Form != null && !s.Form.IsDeleted &&
                            s.Form.ServiceVariantId == null && groupIds.Contains(s.Form.ServiceId))
                .SelectMany(s => s.SectionFields.Select(sf => sf.FieldId))
                .Distinct()
                .ToListAsync(cancellationToken);

            protectedBaseFieldIds = baseFieldList.ToHashSet();
        }

        // 2. Upsert Fields
        var allFieldDtos = (incomingSections ?? new List<FormSectionDto>())
            .SelectMany(s => s.Fields ?? new List<FormFieldDto>())
            .Where(f => f.FieldId != Guid.Empty)
            .GroupBy(f => f.FieldId)
            .Select(g => g.First())
            .ToList();

        var fieldIds = allFieldDtos.Select(f => f.FieldId).ToList();
        var existingFields = await _context.Fields
            .IgnoreQueryFilters()
            .Where(f => fieldIds.Contains(f.Id))
            .ToDictionaryAsync(f => f.Id, cancellationToken);

        foreach (var fDto in allFieldDtos)
        {
            if (existingFields.TryGetValue(fDto.FieldId, out var existingField))
            {
                bool isProtectedSharedBaseField = form.ServiceVariantId.HasValue && protectedBaseFieldIds.Contains(fDto.FieldId);
                if (!isProtectedSharedBaseField)
                {
                    existingField.Label = fDto.Label ?? string.Empty;
                    existingField.FieldType = fDto.Type ?? "text";
                    existingField.ValidationRules = fDto.ValidationRules;
                }
                else if (!string.IsNullOrWhiteSpace(activeVariantDisplayName))
                {
                    var overrideKey = form.IsActive
                        ? activeVariantDisplayName!
                        : $"{activeVariantDisplayName}::form::{form.Id}";
                    existingField.ValidationRules = MergeVariantFieldDtoDiffIntoValidationRules(
                        existingField,
                        fDto,
                        overrideKey);
                }
                existingField.IsDeleted = false;
                existingField.LastModifiedAt = DateTime.UtcNow;
            }
            else
            {
                var newField = new Field
                {
                    Id = fDto.FieldId,
                    Label = fDto.Label ?? string.Empty,
                    FieldType = fDto.Type ?? "text",
                    ValidationRules = fDto.ValidationRules,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };
                await _context.Fields.AddAsync(newField, cancellationToken);
                existingFields[newField.Id] = newField;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // 3. Upsert FormSections
        var existingSections = await _context.FormSections
            .IgnoreQueryFilters()
            .Where(s => s.FormId == form.Id)
            .ToListAsync(cancellationToken);

        var existingSectionsByKey = existingSections
            .GroupBy(s => s.Key, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        var existingSectionsByNormTitle = existingSections
            .Where(s => !string.IsNullOrWhiteSpace(s.Title))
            .GroupBy(s => NormalizeAlphaNum(s.Title), StringComparer.OrdinalIgnoreCase)
            .Where(g => !string.IsNullOrEmpty(g.Key))
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        var usedSectionKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var usedExistingSectionIds = new HashSet<Guid>();
        var targetSections = new List<FormSection>();

        int secIndex = 0;
        foreach (var secDto in incomingSections ?? new List<FormSectionDto>())
        {
            var rawKey = string.IsNullOrWhiteSpace(secDto.Key)
                ? $"section-{secIndex}"
                : secDto.Key.Trim();

            var uniqueKey = rawKey;
            int suffix = 1;
            while (usedSectionKeys.Contains(uniqueKey))
            {
                suffix++;
                uniqueKey = $"{rawKey}-{suffix}";
            }
            usedSectionKeys.Add(uniqueKey);

            var normTitle = NormalizeAlphaNum(secDto.Title);
            if (!existingSectionsByKey.TryGetValue(uniqueKey, out var existingSec) ||
                usedExistingSectionIds.Contains(existingSec.Id))
            {
                existingSec = null;
                if (!string.IsNullOrEmpty(normTitle) &&
                    existingSectionsByNormTitle.TryGetValue(normTitle, out var byTitle) &&
                    !usedExistingSectionIds.Contains(byTitle.Id))
                {
                    existingSec = byTitle;
                }
            }

            if (existingSec != null)
            {
                usedExistingSectionIds.Add(existingSec.Id);
                existingSec.Key = uniqueKey;
                existingSec.Title = string.IsNullOrWhiteSpace(secDto.Title) ? $"Section {secIndex + 1}" : secDto.Title.Trim();
                existingSec.OrderIndex = secIndex;
                existingSec.IsDeleted = false;
                existingSec.LastModifiedAt = DateTime.UtcNow;
                targetSections.Add(existingSec);
            }
            else
            {
                var newSec = new FormSection
                {
                    Id = Guid.NewGuid(),
                    FormId = form.Id,
                    Key = uniqueKey,
                    Title = string.IsNullOrWhiteSpace(secDto.Title) ? $"Section {secIndex + 1}" : secDto.Title.Trim(),
                    OrderIndex = secIndex,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };
                await _context.FormSections.AddAsync(newSec, cancellationToken);
                existingSectionsByKey[newSec.Key] = newSec;
                usedExistingSectionIds.Add(newSec.Id);
                targetSections.Add(newSec);
            }
            secIndex++;
        }

        // Remove obsolete sections
        var targetSectionIds = targetSections.Select(s => s.Id).ToHashSet();
        var obsoleteSections = existingSections.Where(s => !targetSectionIds.Contains(s.Id)).ToList();
        if (obsoleteSections.Count > 0)
        {
            var obsoleteSecIds = obsoleteSections.Select(s => s.Id).ToList();
            var obsoleteSf = await _context.SectionFields
                .Where(sf => obsoleteSecIds.Contains(sf.FormSectionId))
                .ToListAsync(cancellationToken);

            if (obsoleteSf.Count > 0)
            {
                _context.SectionFields.RemoveRange(obsoleteSf);
            }
            _context.FormSections.RemoveRange(obsoleteSections);
        }
        await _context.SaveChangesAsync(cancellationToken);

        foreach (var obsoleteSec in obsoleteSections)
        {
            form.Sections.Remove(obsoleteSec);
            _context.Entry(obsoleteSec).State = EntityState.Detached;
        }

        // 4. Refresh SectionFields for each section
        var allActiveSecIds = targetSections.Select(s => s.Id).ToList();
        var currentSectionFields = await _context.SectionFields
            .Where(sf => allActiveSecIds.Contains(sf.FormSectionId))
            .ToListAsync(cancellationToken);

        if (currentSectionFields.Count > 0)
        {
            _context.SectionFields.RemoveRange(currentSectionFields);
            await _context.SaveChangesAsync(cancellationToken);
        }

        secIndex = 0;
        var newSectionFields = new List<SectionField>();
        foreach (var secDto in incomingSections ?? new List<FormSectionDto>())
        {
            if (secIndex >= targetSections.Count) break;
            var sectionEntity = targetSections[secIndex];

            int fIdx = 0;
            var seenFieldIdsInSec = new HashSet<Guid>();
            var seenLabelTypesInSec = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var fDto in secDto.Fields ?? new List<FormFieldDto>())
            {
                if (fDto.FieldId == Guid.Empty || !seenFieldIdsInSec.Add(fDto.FieldId))
                {
                    continue;
                }

                if (!string.Equals(fDto.Type, "divider", StringComparison.OrdinalIgnoreCase))
                {
                    var normLbl = NormalizeAlphaNum(fDto.Label);
                    var normType = (fDto.Type ?? "text").Trim().ToLowerInvariant();
                    if (!string.IsNullOrEmpty(normLbl) && !seenLabelTypesInSec.Add($"{normLbl}::{normType}"))
                    {
                        continue;
                    }
                }

                newSectionFields.Add(new SectionField
                {
                    FormSectionId = sectionEntity.Id,
                    FieldId = fDto.FieldId,
                    IsRequired = fDto.IsRequired,
                    OrderIndex = fIdx++,
                    VisibilityCondition = fDto.VisibilityCondition
                });
            }
            secIndex++;
        }

        if (newSectionFields.Count > 0)
        {
            await _context.SectionFields.AddRangeAsync(newSectionFields, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return await GetByIdAsync(form.Id, cancellationToken) ?? form;
    }

    private async Task DeactivateOtherActiveFormsInScopeAsync(Form activeForm, CancellationToken cancellationToken)
    {
        IQueryable<Form> otherActiveFormsQuery;

        if (activeForm.ServiceVariantId.HasValue && activeForm.ServiceVariantId.Value != Guid.Empty)
        {
            otherActiveFormsQuery = _context.Forms
                .IgnoreQueryFilters()
                .Where(f => f.ServiceVariantId == activeForm.ServiceVariantId.Value &&
                            f.Id != activeForm.Id &&
                            !f.IsDeleted &&
                            f.IsActive);
        }
        else if (activeForm.ServiceId != Guid.Empty)
        {
            var groupIds = GetCanonicalServiceGroupIds(activeForm.ServiceId);
            otherActiveFormsQuery = _context.Forms
                .IgnoreQueryFilters()
                .Where(f => groupIds.Contains(f.ServiceId) &&
                            f.ServiceVariantId == null &&
                            f.Id != activeForm.Id &&
                            !f.IsDeleted &&
                            f.IsActive);
        }
        else
        {
            return;
        }

        var otherActiveForms = await otherActiveFormsQuery.ToListAsync(cancellationToken);
        if (otherActiveForms.Count > 0)
        {
            foreach (var other in otherActiveForms)
            {
                other.IsActive = false;
                other.LastModifiedAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task PromoteVariantDraftOverridesAsync(
        Form variantForm,
        ServiceVariant variant,
        CancellationToken cancellationToken = default)
    {
        var loadedForm = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Sections.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.SectionFields)
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == variantForm.Id, cancellationToken) ?? variantForm;

        var variantDisplayName = FormatVariantDisplayName(variant);
        var draftSuffix = $"::form::{loadedForm.Id}";
        bool anyUpdated = false;

        foreach (var sf in loadedForm.Sections.Where(s => !s.IsDeleted).SelectMany(s => s.SectionFields))
        {
            if (sf.Field == null || string.IsNullOrWhiteSpace(sf.Field.ValidationRules) ||
                !sf.Field.ValidationRules.Trim().StartsWith("{", StringComparison.Ordinal))
            {
                continue;
            }

            try
            {
                var obj = JsonNode.Parse(sf.Field.ValidationRules.Trim()) as JsonObject;
                if (obj?["variantOverrides"] is not JsonObject ovObj) continue;

                var draftKeys = ovObj
                    .Select(kvp => kvp.Key)
                    .Where(k => k.EndsWith(draftSuffix, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (draftKeys.Count == 0) continue;

                var draftKey = draftKeys[0];
                var draftNode = ovObj[draftKey]?.DeepClone();
                foreach (var k in draftKeys) ovObj.Remove(k);

                if (draftNode != null)
                {
                    ovObj[variantDisplayName] = draftNode;
                }
                obj["variantOverrides"] = ovObj;
                sf.Field.ValidationRules = obj.ToJsonString();
                anyUpdated = true;
            }
            catch
            {
                // ignore malformed JSON
            }
        }

        if (anyUpdated)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task SyncVariantFormToBaseFormAsync(
        Form variantForm,
        ServiceVariant variant,
        CancellationToken cancellationToken = default)
    {
        if (!variantForm.IsActive) return;

        var groupIds = GetCanonicalServiceGroupIds(variant.ServiceId);
        var canonicalId = ResolveCanonicalServiceId(variant.ServiceId);

        var baseForm = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .Where(f => groupIds.Contains(f.ServiceId) && f.ServiceVariantId == null && !f.IsDeleted)
            .OrderByDescending(f => f.IsActive)
            .ThenByDescending(f => f.ServiceId == canonicalId)
            .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (baseForm == null) return;

        // Reload raw variant form sections & fields with incoming DTO values if needed
        var loadedVariantForm = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == variantForm.Id, cancellationToken) ?? variantForm;

        var variantDisplayName = FormatVariantDisplayName(variant);
        var variantIdStr = variant.Id.ToString();

        var baseSectionsList = baseForm.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex).ToList();
        var baseSectionsByKey = baseSectionsList
            .GroupBy(s => (s.Key ?? string.Empty).Trim(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        var baseSectionsByNormTitle = baseSectionsList
            .Where(s => !string.IsNullOrWhiteSpace(s.Title))
            .GroupBy(s => NormalizeAlphaNum(s.Title), StringComparer.OrdinalIgnoreCase)
            .Where(g => !string.IsNullOrEmpty(g.Key))
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        var baseSfByFieldId = baseSectionsList
            .SelectMany(s => s.SectionFields)
            .GroupBy(sf => sf.FieldId)
            .ToDictionary(g => g.Key, g => g.First());

        var variantFieldIds = new HashSet<Guid>();
        bool anyChanges = false;

        // 1. Upsert new sections & newly added variant fields into Base Form preserving relative position
        int prevMatchedBaseSecIdx = -1;
        foreach (var vSec in loadedVariantForm.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
        {
            var secKey = string.IsNullOrWhiteSpace(vSec.Key) ? "general" : vSec.Key.Trim();
            var normSecTitle = NormalizeAlphaNum(vSec.Title);

            if (!baseSectionsByKey.TryGetValue(secKey, out var baseSec) &&
                (string.IsNullOrEmpty(normSecTitle) || !baseSectionsByNormTitle.TryGetValue(normSecTitle, out baseSec)))
            {
                int insertAt = prevMatchedBaseSecIdx >= 0 && prevMatchedBaseSecIdx + 1 <= baseSectionsList.Count
                    ? prevMatchedBaseSecIdx + 1
                    : baseSectionsList.Count;

                baseSec = new FormSection
                {
                    Id = Guid.NewGuid(),
                    FormId = baseForm.Id,
                    Key = secKey,
                    Title = vSec.Title,
                    OrderIndex = insertAt,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow,
                    SectionFields = new List<SectionField>()
                };
                await _context.FormSections.AddAsync(baseSec, cancellationToken);
                baseSectionsList.Insert(insertAt, baseSec);
                for (int i = 0; i < baseSectionsList.Count; i++)
                {
                    baseSectionsList[i].OrderIndex = i;
                }
                baseSectionsByKey[secKey] = baseSec;
                if (!string.IsNullOrEmpty(normSecTitle))
                {
                    baseSectionsByNormTitle[normSecTitle] = baseSec;
                }
                prevMatchedBaseSecIdx = insertAt;
                anyChanges = true;
            }
            else
            {
                prevMatchedBaseSecIdx = baseSectionsList.IndexOf(baseSec);
            }

            var orderedBaseSfs = baseSec.SectionFields.OrderBy(x => x.OrderIndex).ToList();
            var baseSecSfByLabelType = orderedBaseSfs
                .Where(sf => sf.Field != null && !string.Equals(sf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase))
                .GroupBy(sf => $"{NormalizeAlphaNum(sf.Field!.Label)}::{(sf.Field.FieldType ?? "text").Trim().ToLowerInvariant()}", StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

            Guid? predecessorFieldId = null;

            foreach (var vsf in vSec.SectionFields.OrderBy(x => x.OrderIndex))
            {
                if (vsf.FieldId == Guid.Empty) continue;

                if (!baseSfByFieldId.TryGetValue(vsf.FieldId, out var existingBaseSf) &&
                    vsf.Field != null &&
                    !string.Equals(vsf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase))
                {
                    var lKey = $"{NormalizeAlphaNum(vsf.Field.Label)}::{(vsf.Field.FieldType ?? "text").Trim().ToLowerInvariant()}";
                    if (!string.IsNullOrEmpty(NormalizeAlphaNum(vsf.Field.Label)) &&
                        baseSecSfByLabelType.TryGetValue(lKey, out var matchedByLabel))
                    {
                        existingBaseSf = matchedByLabel;
                    }
                }

                variantFieldIds.Add(existingBaseSf?.FieldId ?? vsf.FieldId);

                if (existingBaseSf == null)
                {
                    // Brand-new field added inside customized Service Variant -> reflect in Base Form ("All Sections & Fields")!
                    var scopedCond = UpsertVariantInclusionInCondition(vsf.VisibilityCondition, variantDisplayName, variantIdStr);
                    if (vsf.Field != null)
                    {
                        vsf.Field.ValidationRules = MergeConditionIntoValidationRules(vsf.Field.ValidationRules, scopedCond);
                    }

                    int insertSfIdx = orderedBaseSfs.Count;
                    if (predecessorFieldId.HasValue)
                    {
                        int predIdx = orderedBaseSfs.FindIndex(x => x.FieldId == predecessorFieldId.Value);
                        if (predIdx >= 0) insertSfIdx = predIdx + 1;
                    }

                    var addedBaseSf = new SectionField
                    {
                        FormSectionId = baseSec.Id,
                        FieldId = vsf.FieldId,
                        Field = vsf.Field,
                        IsRequired = vsf.IsRequired,
                        OrderIndex = insertSfIdx,
                        VisibilityCondition = scopedCond
                    };
                    await _context.SectionFields.AddAsync(addedBaseSf, cancellationToken);
                    orderedBaseSfs.Insert(insertSfIdx, addedBaseSf);
                    for (int i = 0; i < orderedBaseSfs.Count; i++)
                    {
                        orderedBaseSfs[i].OrderIndex = i;
                    }
                    baseSfByFieldId[vsf.FieldId] = addedBaseSf;
                    if (vsf.Field != null && !string.Equals(vsf.Field.FieldType, "divider", StringComparison.OrdinalIgnoreCase))
                    {
                        var lKey = $"{NormalizeAlphaNum(vsf.Field.Label)}::{(vsf.Field.FieldType ?? "text").Trim().ToLowerInvariant()}";
                        if (!string.IsNullOrEmpty(NormalizeAlphaNum(vsf.Field.Label)))
                        {
                            baseSecSfByLabelType[lKey] = addedBaseSf;
                        }
                    }
                    anyChanges = true;
                }
                else
                {
                    // Ensure not excluded for this variant if re-included
                    var cleanedCond = RemoveVariantExclusionFromCondition(existingBaseSf.VisibilityCondition, variant, variantDisplayName);
                    if (cleanedCond != existingBaseSf.VisibilityCondition)
                    {
                        existingBaseSf.VisibilityCondition = cleanedCond;
                        if (existingBaseSf.Field != null)
                        {
                            existingBaseSf.Field.ValidationRules = MergeConditionIntoValidationRules(existingBaseSf.Field.ValidationRules, cleanedCond);
                        }
                        anyChanges = true;
                    }

                    // Record required override if different from Base Form
                    if (existingBaseSf.IsRequired != vsf.IsRequired && existingBaseSf.Field != null)
                    {
                        existingBaseSf.Field.ValidationRules = UpsertVariantOverrideInValidationRules(
                            existingBaseSf.Field.ValidationRules,
                            variantDisplayName,
                            labelOverride: null,
                            requiredOverride: vsf.IsRequired);
                        anyChanges = true;
                    }
                }

                predecessorFieldId = vsf.FieldId;
            }
        }

        // 2. Mark Base Form fields omitted from variantForm as excluded for this variant
        foreach (var bsf in baseSfByFieldId.Values)
        {
            if (variantFieldIds.Contains(bsf.FieldId)) continue;
            if (string.Equals(bsf.Field?.FieldType, "divider", StringComparison.OrdinalIgnoreCase)) continue;

            if (IsConditionApplicableToVariant(bsf.VisibilityCondition, variant))
            {
                var updatedCond = AddVariantExclusionToCondition(bsf.VisibilityCondition, variant, variantDisplayName);
                if (updatedCond != bsf.VisibilityCondition)
                {
                    bsf.VisibilityCondition = updatedCond;
                    if (bsf.Field != null)
                    {
                        bsf.Field.ValidationRules = MergeConditionIntoValidationRules(bsf.Field.ValidationRules, updatedCond);
                    }
                    anyChanges = true;
                }
            }
        }

        if (anyChanges)
        {
            baseForm.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task SyncBaseFormToVariantFormsAsync(
        Form baseForm,
        bool overwriteCustomizedOverrides,
        CancellationToken cancellationToken = default)
    {
        if (!baseForm.IsActive || baseForm.ServiceVariantId.HasValue) return;

        var groupIds = GetCanonicalServiceGroupIds(baseForm.ServiceId);
        var activeVariantForms = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.ServiceVariant)
            .Include(f => f.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .Where(f => groupIds.Contains(f.ServiceId) && f.ServiceVariantId.HasValue && f.IsActive && !f.IsDeleted)
            .ToListAsync(cancellationToken);

        if (activeVariantForms.Count == 0) return;

        var loadedBase = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
                .ThenInclude(s => s.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == baseForm.Id, cancellationToken) ?? baseForm;

        // If user selected "Apply to All Service Variants", clear per-variant label/options overrides on base fields
        if (overwriteCustomizedOverrides)
        {
            foreach (var bSec in loadedBase.Sections.Where(s => !s.IsDeleted))
            {
                foreach (var bsf in bSec.SectionFields)
                {
                    if (bsf.Field != null && !string.IsNullOrWhiteSpace(bsf.Field.ValidationRules))
                    {
                        bsf.Field.ValidationRules = ClearVariantOverridesInValidationRules(bsf.Field.ValidationRules);
                    }
                }
            }
        }

        foreach (var vf in activeVariantForms)
        {
            var variant = vf.ServiceVariant ?? await _context.ServiceVariants
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == vf.ServiceVariantId!.Value, cancellationToken);
            if (variant == null) continue;

            var prevSfByFieldId = vf.Sections
                .Where(s => !s.IsDeleted)
                .SelectMany(s => s.SectionFields)
                .GroupBy(sf => sf.FieldId)
                .ToDictionary(g => g.Key, g => g.First());

            var projectedSections = new List<FormSectionDto>();
            int sOrder = 0;

            foreach (var bSec in loadedBase.Sections.Where(s => !s.IsDeleted).OrderBy(s => s.OrderIndex))
            {
                var secVis = FormSectionDto.ExtractSectionVisibilityCondition(bSec.SectionFields);
                if (!IsConditionApplicableToVariant(secVis, variant))
                {
                    continue;
                }

                var applicableFields = new List<FormFieldDto>();
                int fOrder = 0;

                foreach (var bsf in bSec.SectionFields.OrderBy(x => x.OrderIndex))
                {
                    if (!IsConditionApplicableToVariant(bsf.VisibilityCondition, variant))
                    {
                        continue;
                    }

                    bool isReq = bsf.IsRequired;
                    if (!overwriteCustomizedOverrides && prevSfByFieldId.TryGetValue(bsf.FieldId, out var prevVsf))
                    {
                        isReq = prevVsf.IsRequired;
                    }

                    applicableFields.Add(new FormFieldDto
                    {
                        FieldId = bsf.FieldId,
                        Label = bsf.Field?.Label ?? string.Empty,
                        Type = bsf.Field?.FieldType ?? "text",
                        IsRequired = isReq,
                        OrderIndex = fOrder++,
                        ValidationRules = bsf.Field?.ValidationRules,
                        VisibilityCondition = bsf.VisibilityCondition
                    });
                }

                if (applicableFields.Count > 0 || bSec.SectionFields.Count == 0)
                {
                    var customTitle = !overwriteCustomizedOverrides
                        ? TryExtractVariantSectionTitle(bSec.SectionFields.FirstOrDefault()?.Field?.ValidationRules, variant)
                        : null;

                    projectedSections.Add(new FormSectionDto
                    {
                        Key = bSec.Key,
                        Title = !string.IsNullOrWhiteSpace(customTitle) ? customTitle! : bSec.Title,
                        Required = true,
                        OrderIndex = sOrder++,
                        VisibilityCondition = secVis,
                        Fields = applicableFields
                    });
                }
            }

            // Update the variant form sections & SectionFields in place
            var existingVarSecs = await _context.FormSections
                .IgnoreQueryFilters()
                .Where(s => s.FormId == vf.Id)
                .ToListAsync(cancellationToken);

            var oldSecIds = existingVarSecs.Select(s => s.Id).ToList();
            if (oldSecIds.Count > 0)
            {
                var oldSfs = await _context.SectionFields.Where(sf => oldSecIds.Contains(sf.FormSectionId)).ToListAsync(cancellationToken);
                if (oldSfs.Count > 0) _context.SectionFields.RemoveRange(oldSfs);
                _context.FormSections.RemoveRange(existingVarSecs);
                await _context.SaveChangesAsync(cancellationToken);
            }

            foreach (var pSec in projectedSections)
            {
                var newSec = new FormSection
                {
                    Id = Guid.NewGuid(),
                    FormId = vf.Id,
                    Key = pSec.Key,
                    Title = pSec.Title,
                    OrderIndex = pSec.OrderIndex,
                    IsDeleted = false,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };
                await _context.FormSections.AddAsync(newSec, cancellationToken);

                foreach (var pf in pSec.Fields)
                {
                    await _context.SectionFields.AddAsync(new SectionField
                    {
                        FormSectionId = newSec.Id,
                        FieldId = pf.FieldId,
                        IsRequired = pf.IsRequired,
                        OrderIndex = pf.OrderIndex,
                        VisibilityCondition = pf.VisibilityCondition
                    }, cancellationToken);
                }
            }

            vf.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    private static string UpsertVariantInclusionInCondition(string? rawCond, string variantDisplayName, string variantIdStr)
    {
        JsonObject obj;
        try
        {
            obj = (!string.IsNullOrWhiteSpace(rawCond) && rawCond.Trim().StartsWith("{", StringComparison.Ordinal)
                ? JsonNode.Parse(rawCond.Trim()) as JsonObject
                : null) ?? new JsonObject();
        }
        catch
        {
            obj = new JsonObject();
        }

        var arr = obj["variants"] as JsonArray ?? new JsonArray();
        var existing = arr.Select(x => x?.GetValue<string>() ?? string.Empty)
            .Where(s => !string.IsNullOrWhiteSpace(s) && !string.Equals(s, "__NONE__", StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (!existing.Any(s => string.Equals(s, variantDisplayName, StringComparison.OrdinalIgnoreCase)))
        {
            existing.Add(variantDisplayName);
        }
        if (!existing.Any(s => string.Equals(s, variantIdStr, StringComparison.OrdinalIgnoreCase)))
        {
            existing.Add(variantIdStr);
        }

        var nextArr = new JsonArray();
        foreach (var item in existing) nextArr.Add(item);
        obj["variants"] = nextArr;
        return obj.ToJsonString();
    }

    private static string? RemoveVariantExclusionFromCondition(string? rawCond, ServiceVariant variant, string variantDisplayName)
    {
        if (string.IsNullOrWhiteSpace(rawCond) || !rawCond.Trim().StartsWith("{", StringComparison.Ordinal))
        {
            return rawCond;
        }

        try
        {
            var obj = JsonNode.Parse(rawCond.Trim()) as JsonObject;
            if (obj == null) return rawCond;

            bool changed = false;
            if (obj["excludedVariants"] is JsonArray exclArr)
            {
                var remaining = exclArr
                    .Select(x => x?.GetValue<string>() ?? string.Empty)
                    .Where(s => !string.IsNullOrWhiteSpace(s) && !VariantRuleMatchesVariant(s, variant))
                    .ToList();

                if (remaining.Count != exclArr.Count)
                {
                    changed = true;
                    if (remaining.Count == 0) obj.Remove("excludedVariants");
                    else
                    {
                        var nextExcl = new JsonArray();
                        foreach (var r in remaining) nextExcl.Add(r);
                        obj["excludedVariants"] = nextExcl;
                    }
                }
            }

            if (obj["variants"] is JsonArray varArr)
            {
                var currentVars = varArr
                    .Select(x => x?.GetValue<string>() ?? string.Empty)
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .ToList();

                if (currentVars.Count > 0 && !currentVars.Any(s => VariantRuleMatchesVariant(s, variant)))
                {
                    var cleaned = currentVars.Where(s => !string.Equals(s, "__NONE__", StringComparison.OrdinalIgnoreCase)).ToList();
                    cleaned.Add(variantDisplayName);
                    var nextVarArr = new JsonArray();
                    foreach (var c in cleaned) nextVarArr.Add(c);
                    obj["variants"] = nextVarArr;
                    changed = true;
                }
            }

            if (!changed) return rawCond;
            return obj.Count == 0 ? null : obj.ToJsonString();
        }
        catch
        {
            return rawCond;
        }
    }

    private static string AddVariantExclusionToCondition(string? rawCond, ServiceVariant variant, string variantDisplayName)
    {
        JsonObject obj;
        try
        {
            obj = (!string.IsNullOrWhiteSpace(rawCond) && rawCond.Trim().StartsWith("{", StringComparison.Ordinal)
                ? JsonNode.Parse(rawCond.Trim()) as JsonObject
                : null) ?? new JsonObject();
        }
        catch
        {
            obj = new JsonObject();
        }

        // If this field was scoped exclusively via `variants`, remove matching tokens (or set __NONE__ if zero remain)
        if (obj["variants"] is JsonArray varArr && varArr.Count > 0)
        {
            var remainingVars = varArr
                .Select(x => x?.GetValue<string>() ?? string.Empty)
                .Where(s => !string.IsNullOrWhiteSpace(s) && !VariantRuleMatchesVariant(s, variant))
                .ToList();

            var nextVarArr = new JsonArray();
            if (remainingVars.Count == 0)
            {
                nextVarArr.Add("__NONE__");
            }
            else
            {
                foreach (var r in remainingVars) nextVarArr.Add(r);
            }
            obj["variants"] = nextVarArr;
            return obj.ToJsonString();
        }

        var exclArr = obj["excludedVariants"] as JsonArray ?? new JsonArray();
        var existingExcl = exclArr
            .Select(x => x?.GetValue<string>() ?? string.Empty)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToList();

        if (!existingExcl.Any(s => VariantRuleMatchesVariant(s, variant)))
        {
            existingExcl.Add(variantDisplayName);
        }

        var nextExclArr = new JsonArray();
        foreach (var e in existingExcl) nextExclArr.Add(e);
        obj["excludedVariants"] = nextExclArr;
        return obj.ToJsonString();
    }

    private static string? MergeConditionIntoValidationRules(string? validationRules, string? visibilityCondition)
    {
        JsonObject obj;
        try
        {
            obj = (!string.IsNullOrWhiteSpace(validationRules) && validationRules.Trim().StartsWith("{", StringComparison.Ordinal)
                ? JsonNode.Parse(validationRules.Trim()) as JsonObject
                : null) ?? new JsonObject();
        }
        catch
        {
            return validationRules;
        }

        if (string.IsNullOrWhiteSpace(visibilityCondition))
        {
            obj.Remove("condition");
        }
        else
        {
            try
            {
                obj["condition"] = JsonNode.Parse(visibilityCondition);
            }
            catch { /* ignore */ }
        }

        return obj.ToJsonString();
    }

    private static string MergeVariantFieldDtoDiffIntoValidationRules(
        Field baseField,
        FormFieldDto variantDto,
        string variantKey)
    {
        JsonObject baseObj;
        try
        {
            baseObj = (!string.IsNullOrWhiteSpace(baseField.ValidationRules) && baseField.ValidationRules.Trim().StartsWith("{", StringComparison.Ordinal)
                ? JsonNode.Parse(baseField.ValidationRules.Trim()) as JsonObject
                : null) ?? new JsonObject();
        }
        catch
        {
            baseObj = new JsonObject();
        }

        JsonObject? incomingObj = null;
        if (!string.IsNullOrWhiteSpace(variantDto.ValidationRules) && variantDto.ValidationRules.Trim().StartsWith("{", StringComparison.Ordinal))
        {
            try { incomingObj = JsonNode.Parse(variantDto.ValidationRules.Trim()) as JsonObject; }
            catch { incomingObj = null; }
        }

        var overridesObj = baseObj["variantOverrides"] as JsonObject ?? new JsonObject();
        var entry = overridesObj[variantKey] as JsonObject ?? new JsonObject();

        var dtoLabel = (variantDto.Label ?? string.Empty).Trim();
        var baseLabel = (baseField.Label ?? string.Empty).Trim();
        if (!string.IsNullOrEmpty(dtoLabel) && !string.Equals(dtoLabel, baseLabel, StringComparison.Ordinal))
        {
            entry["label"] = dtoLabel;
        }
        else
        {
            entry.Remove("label");
        }

        if (incomingObj != null)
        {
            var incPh = incomingObj["placeholder"]?.GetValue<string>();
            var basePh = baseObj["placeholder"]?.GetValue<string>();
            if (!string.Equals(incPh ?? string.Empty, basePh ?? string.Empty, StringComparison.Ordinal))
            {
                if (incPh != null) entry["placeholder"] = incPh;
            }

            var incHt = incomingObj["helpText"]?.GetValue<string>();
            var baseHt = baseObj["helpText"]?.GetValue<string>();
            if (!string.Equals(incHt ?? string.Empty, baseHt ?? string.Empty, StringComparison.Ordinal))
            {
                if (incHt != null) entry["helpText"] = incHt;
            }

            if (incomingObj["options"] is JsonArray incOpts)
            {
                var baseOptsRaw = baseObj["options"]?.ToJsonString() ?? string.Empty;
                var incOptsRaw = incOpts.ToJsonString();
                if (!string.Equals(baseOptsRaw, incOptsRaw, StringComparison.Ordinal))
                {
                    entry["options"] = JsonNode.Parse(incOptsRaw);
                }
            }
        }

        if (entry.Count > 0)
        {
            overridesObj[variantKey] = entry;
            baseObj["variantOverrides"] = overridesObj;
        }
        else
        {
            overridesObj.Remove(variantKey);
            if (overridesObj.Count == 0) baseObj.Remove("variantOverrides");
            else baseObj["variantOverrides"] = overridesObj;
        }

        return baseObj.ToJsonString();
    }

    private static string UpsertVariantOverrideInValidationRules(
        string? validationRules,
        string variantKey,
        string? labelOverride,
        bool? requiredOverride)
    {
        JsonObject obj;
        try
        {
            obj = (!string.IsNullOrWhiteSpace(validationRules) && validationRules.Trim().StartsWith("{", StringComparison.Ordinal)
                ? JsonNode.Parse(validationRules.Trim()) as JsonObject
                : null) ?? new JsonObject();
        }
        catch
        {
            obj = new JsonObject();
        }

        var overridesObj = obj["variantOverrides"] as JsonObject ?? new JsonObject();
        var entry = overridesObj[variantKey] as JsonObject ?? new JsonObject();
        if (!string.IsNullOrWhiteSpace(labelOverride)) entry["label"] = labelOverride;
        if (requiredOverride.HasValue) entry["required"] = requiredOverride.Value;
        overridesObj[variantKey] = entry;
        obj["variantOverrides"] = overridesObj;
        return obj.ToJsonString();
    }

    private static string ClearVariantOverridesInValidationRules(string validationRules)
    {
        if (!validationRules.Trim().StartsWith("{", StringComparison.Ordinal)) return validationRules;
        try
        {
            var obj = JsonNode.Parse(validationRules.Trim()) as JsonObject;
            if (obj == null) return validationRules;
            obj.Remove("variantOverrides");
            obj.Remove("sectionVariantTitles");
            return obj.ToJsonString();
        }
        catch
        {
            return validationRules;
        }
    }

    public async Task<Form?> SetFormActiveAsync(Guid formId, CancellationToken cancellationToken = default)
    {
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == formId && !f.IsDeleted, cancellationToken);

        if (form == null)
        {
            return null;
        }

        form.IsActive = true;
        form.LastModifiedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await DeactivateOtherActiveFormsInScopeAsync(form, cancellationToken);
        return form;
    }

    public async Task<List<Form>> GetVersionsByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        var groupIds = GetCanonicalServiceGroupIds(serviceId);
        return await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted))
                .ThenInclude(fs => fs.SectionFields)
            .Where(f => groupIds.Contains(f.ServiceId) && !f.IsDeleted)
            .OrderByDescending(f => f.IsActive)
            .ThenByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Form?> GetActiveVariantFormAsync(Guid variantId, CancellationToken cancellationToken = default)
    {
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .Where(f => f.ServiceVariantId == variantId && !f.IsDeleted)
            .OrderByDescending(f => f.IsActive)
            .ThenByDescending(f => f.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (form != null)
        {
            DeduplicateFormSectionsAndFieldsInMemory(form);
        }

        return form;
    }

    public async Task<bool> RevertVariantFormAsync(Guid variantId, CancellationToken cancellationToken = default)
    {
        var variant = await _context.ServiceVariants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v => v.Id == variantId, cancellationToken);

        var variantForms = await _context.Forms
            .IgnoreQueryFilters()
            .Where(f => f.ServiceVariantId == variantId && !f.IsDeleted)
            .ToListAsync(cancellationToken);

        var revertedFormIds = variantForms.Select(vf => vf.Id).ToHashSet();

        foreach (var form in variantForms)
        {
            form.IsDeleted = true;
            form.IsActive = false;
            form.LastModifiedAt = DateTime.UtcNow;
        }

        if (variant != null)
        {
            var groupIds = GetCanonicalServiceGroupIds(variant.ServiceId);
            var activeBaseForms = await _context.Forms
                .IgnoreQueryFilters()
                .Include(f => f.Sections.Where(s => !s.IsDeleted))
                    .ThenInclude(s => s.SectionFields)
                        .ThenInclude(sf => sf.Field)
                .Where(f => groupIds.Contains(f.ServiceId) && f.ServiceVariantId == null && !f.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var bf in activeBaseForms)
            {
                foreach (var sec in bf.Sections.Where(s => !s.IsDeleted))
                {
                    foreach (var sf in sec.SectionFields.ToList())
                    {
                        bool isCanonicalSeededField = sf.FieldId.ToString().StartsWith("fd000000-", StringComparison.OrdinalIgnoreCase);
                        var defaultSeededCond = FastTrackFormSeeder.GetCanonicalFieldDefaultVisibilityCondition(bf.Key, sf.FieldId.ToString());

                        // If this field was added exclusively inside the customized variant and is not a canonical Base Form field,
                        // strip the reverted variant from its `variants` list (marking __NONE__ if no other variants remain).
                        // Otherwise (for Base Form fields), restore its canonical Base Form applicability for the reverted variant!
                        var revertedCond = StripRevertedVariantFromCondition(sf.VisibilityCondition, variant, isCanonicalSeededField, defaultSeededCond);
                        if (revertedCond != sf.VisibilityCondition)
                        {
                            sf.VisibilityCondition = revertedCond;
                        }

                        // Clean variantOverrides, sectionVariantTitles, condition, and sectionVisibilityCondition in ValidationRules
                        if (sf.Field != null && !string.IsNullOrWhiteSpace(sf.Field.ValidationRules) &&
                            sf.Field.ValidationRules.Trim().StartsWith("{", StringComparison.Ordinal))
                        {
                            try
                            {
                                var obj = JsonNode.Parse(sf.Field.ValidationRules.Trim()) as JsonObject;
                                if (obj != null)
                                {
                                    bool rulesChanged = false;

                                    if (obj["variantOverrides"] is JsonObject ovObj)
                                    {
                                        var keysToRemove = ovObj
                                            .Select(kvp => kvp.Key)
                                            .Where(k =>
                                                VariantRuleMatchesVariant(k, variant) ||
                                                revertedFormIds.Any(fid => k.EndsWith($"::form::{fid}", StringComparison.OrdinalIgnoreCase)))
                                            .ToList();
                                        if (keysToRemove.Count > 0)
                                        {
                                            foreach (var k in keysToRemove) ovObj.Remove(k);
                                            if (ovObj.Count == 0) obj.Remove("variantOverrides");
                                            rulesChanged = true;
                                        }
                                    }

                                    if (obj["sectionVariantTitles"] is JsonObject titlesObj)
                                    {
                                        var titleKeysToRemove = titlesObj
                                            .Select(kvp => kvp.Key)
                                            .Where(k => VariantRuleMatchesVariant(k, variant))
                                            .ToList();
                                        if (titleKeysToRemove.Count > 0)
                                        {
                                            foreach (var k in titleKeysToRemove) titlesObj.Remove(k);
                                            if (titlesObj.Count == 0) obj.Remove("sectionVariantTitles");
                                            rulesChanged = true;
                                        }
                                    }

                                    if (obj["condition"] is JsonObject condObj)
                                    {
                                        var cleanedInnerCond = StripRevertedVariantFromCondition(condObj.ToJsonString(), variant, isCanonicalSeededField, defaultSeededCond);
                                        if (string.IsNullOrWhiteSpace(cleanedInnerCond))
                                        {
                                            obj.Remove("condition");
                                            rulesChanged = true;
                                        }
                                        else if (cleanedInnerCond != condObj.ToJsonString())
                                        {
                                            obj["condition"] = JsonNode.Parse(cleanedInnerCond);
                                            rulesChanged = true;
                                        }
                                    }

                                    if (obj["sectionVisibilityCondition"] is JsonValue secVisVal &&
                                        secVisVal.TryGetValue<string>(out var rawSecVis) &&
                                        !string.IsNullOrWhiteSpace(rawSecVis))
                                    {
                                        var cleanedSecVis = StripRevertedVariantFromCondition(rawSecVis, variant, isCanonicalSeededField: true);
                                        if (string.IsNullOrWhiteSpace(cleanedSecVis))
                                        {
                                            obj.Remove("sectionVisibilityCondition");
                                            rulesChanged = true;
                                        }
                                        else if (cleanedSecVis != rawSecVis)
                                        {
                                            obj["sectionVisibilityCondition"] = cleanedSecVis;
                                            rulesChanged = true;
                                        }
                                    }

                                    if (rulesChanged)
                                    {
                                        sf.Field.ValidationRules = obj.ToJsonString();
                                    }
                                }
                            }
                            catch { /* ignore */ }
                        }
                    }
                }
                bf.LastModifiedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string? StripRevertedVariantFromCondition(
        string? rawCond,
        ServiceVariant variant,
        bool isCanonicalSeededField = false,
        string? defaultSeededCond = null)
    {
        bool hasDefaultSeededCond = !string.IsNullOrWhiteSpace(defaultSeededCond);
        bool canonicallyApplicable = !hasDefaultSeededCond || IsConditionApplicableToVariant(defaultSeededCond, variant);

        if (string.IsNullOrWhiteSpace(rawCond) || !rawCond.Trim().StartsWith("{", StringComparison.Ordinal))
        {
            if (hasDefaultSeededCond && !canonicallyApplicable)
            {
                return defaultSeededCond;
            }
            return rawCond;
        }

        try
        {
            var obj = JsonNode.Parse(rawCond.Trim()) as JsonObject;
            if (obj == null) return rawCond;

            bool changed = false;

            if (hasDefaultSeededCond && !canonicallyApplicable)
            {
                // This canonical field is NOT applicable to this variant in the Base Form by default (e.g. noOfYears on Modification / Permit to Purchase).
                // Ensure the reverted variant is removed from `variants` (or re-excluded if `excludedVariants` is used).
                if (obj["variants"] is JsonArray defVarArr && defVarArr.Count > 0)
                {
                    var remaining = defVarArr
                        .Select(x => x?.GetValue<string>() ?? string.Empty)
                        .Where(s => !string.IsNullOrWhiteSpace(s) && !VariantRuleMatchesVariant(s, variant))
                        .ToList();
                    if (remaining.Count != defVarArr.Count)
                    {
                        var next = new JsonArray();
                        if (remaining.Count == 0) next.Add("__NONE__");
                        else foreach (var r in remaining) next.Add(r);
                        obj["variants"] = next;
                        changed = true;
                    }
                }
                else
                {
                    var exclArr = obj["excludedVariants"] as JsonArray ?? new JsonArray();
                    var currentExcl = exclArr
                        .Select(x => x?.GetValue<string>() ?? string.Empty)
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .ToList();
                    if (!currentExcl.Any(s => VariantRuleMatchesVariant(s, variant)))
                    {
                        currentExcl.Add(FormatVariantDisplayName(variant));
                        var next = new JsonArray();
                        foreach (var r in currentExcl) next.Add(r);
                        obj["excludedVariants"] = next;
                        changed = true;
                    }
                }

                if (!changed) return rawCond;
                return obj.Count == 0 ? null : obj.ToJsonString();
            }

            // 1. Always remove this variant from excludedVariants so Base Form fields hidden for this variant are restored!
            if (obj["excludedVariants"] is JsonArray exclArr2)
            {
                var remaining = exclArr2
                    .Select(x => x?.GetValue<string>() ?? string.Empty)
                    .Where(s => !string.IsNullOrWhiteSpace(s) && !VariantRuleMatchesVariant(s, variant))
                    .ToList();
                if (remaining.Count != exclArr2.Count)
                {
                    changed = true;
                    if (remaining.Count == 0) obj.Remove("excludedVariants");
                    else
                    {
                        var next = new JsonArray();
                        foreach (var r in remaining) next.Add(r);
                        obj["excludedVariants"] = next;
                    }
                }
            }

            // 2. Handle `variants`:
            // - If this is a canonical Base Form field and `variants` was set to `["__NONE__"]` (or excluded this canonically applicable variant),
            //   restore this variant (or remove `variants` if it only had `__NONE__` and no defaultSeededCond) so the Base Form field reflects again!
            // - If this is a custom field added exclusively inside the customized variant, remove the reverted variant from `variants`.
            if (obj["variants"] is JsonArray varArr && varArr.Count > 0)
            {
                var currentTokens = varArr
                    .Select(x => x?.GetValue<string>() ?? string.Empty)
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .ToList();

                if (isCanonicalSeededField &&
                    !hasDefaultSeededCond &&
                    currentTokens.All(t => string.Equals(t, "__NONE__", StringComparison.OrdinalIgnoreCase)))
                {
                    obj.Remove("variants");
                    changed = true;
                }
                else if (isCanonicalSeededField && hasDefaultSeededCond && canonicallyApplicable)
                {
                    if (!currentTokens.Any(s => VariantRuleMatchesVariant(s, variant)))
                    {
                        var cleaned = currentTokens
                            .Where(t => !string.Equals(t, "__NONE__", StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        cleaned.Add(FormatVariantDisplayName(variant));
                        var next = new JsonArray();
                        foreach (var r in cleaned) next.Add(r);
                        obj["variants"] = next;
                        changed = true;
                    }
                }
                else if (!isCanonicalSeededField)
                {
                    var remaining = currentTokens
                        .Where(s => !VariantRuleMatchesVariant(s, variant))
                        .ToList();
                    if (remaining.Count != currentTokens.Count)
                    {
                        changed = true;
                        var next = new JsonArray();
                        if (remaining.Count == 0) next.Add("__NONE__");
                        else foreach (var r in remaining) next.Add(r);
                        obj["variants"] = next;
                    }
                }
            }

            if (!changed) return rawCond;
            return obj.Count == 0 ? null : obj.ToJsonString();
        }
        catch
        {
            return rawCond;
        }
    }

    public async Task<bool> SetVariantFormActiveAsync(Guid variantId, bool isActive, CancellationToken cancellationToken = default)
    {
        var variantForms = await _context.Forms
            .IgnoreQueryFilters()
            .Where(f => f.ServiceVariantId == variantId && !f.IsDeleted)
            .OrderByDescending(f => f.IsActive)
            .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
            .ToListAsync(cancellationToken);

        if (variantForms.Count == 0) return false;

        if (!isActive)
        {
            foreach (var form in variantForms)
            {
                form.IsActive = false;
                form.LastModifiedAt = DateTime.UtcNow;
            }
        }
        else
        {
            // Strict Single-Active: activate ONLY the primary/latest form for this ServiceVariantId
            for (int i = 0; i < variantForms.Count; i++)
            {
                variantForms[i].IsActive = i == 0;
                variantForms[i].LastModifiedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
