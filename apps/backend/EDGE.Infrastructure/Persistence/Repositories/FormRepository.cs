using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Dtos;

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
        // Permits sharing NTC 1-09 (Svc109Id = 40000000-0000-0000-0000-000000000009)
        [Guid.Parse("40000000-0000-0000-0000-000000000070")] = Guid.Parse("40000000-0000-0000-0000-000000000009"), // NTC_AERO_PERMITS -> NTC_1_09
        [Guid.Parse("40000000-0000-0000-0000-000000000071")] = Guid.Parse("40000000-0000-0000-0000-000000000009"), // NTC_MAR_PERMITS -> NTC_1_09
        [Guid.Parse("40000000-0000-0000-0000-000000000072")] = Guid.Parse("40000000-0000-0000-0000-000000000009"), // NTC_FLM_PERMITS -> NTC_1_09
        [Guid.Parse("40000000-0000-0000-0000-000000000073")] = Guid.Parse("40000000-0000-0000-0000-000000000009"), // NTC_PTE_PERMITS -> NTC_1_09

        // Licenses sharing NTC 1-11 (Svc111Id = 50000000-0000-0000-0000-000000000011)
        [Guid.Parse("50000000-0000-0000-0000-000000000070")] = Guid.Parse("50000000-0000-0000-0000-000000000011"), // NTC_FLM_LICENSES -> NTC_1_11
        [Guid.Parse("50000000-0000-0000-0000-000000000071")] = Guid.Parse("50000000-0000-0000-0000-000000000011"), // NTC_AERO_LICENSES -> NTC_1_11
        [Guid.Parse("50000000-0000-0000-0000-000000000074")] = Guid.Parse("50000000-0000-0000-0000-000000000011"), // NTC_OTHER_LICENSES -> NTC_1_11

        // Permits sharing NTC 1-18 (Svc118Id = 10000000-0000-0000-0000-000000000018)
        [Guid.Parse("40000000-0000-0000-0000-000000000074")] = Guid.Parse("10000000-0000-0000-0000-000000000018"), // NTC_EQUIP_PERMITS -> NTC_1_18
        [Guid.Parse("40000000-0000-0000-0000-000000000075")] = Guid.Parse("10000000-0000-0000-0000-000000000018"), // NTC_MP_PERMITS -> NTC_1_18

        // Copies sharing NTC 1-21 (Svc121Id = 40000000-0000-0000-0000-000000000021)
        [Guid.Parse("40000000-0000-0000-0000-000000000076")] = Guid.Parse("40000000-0000-0000-0000-000000000021"), // NTC_COPY_PERMITS -> NTC_1_21
        [Guid.Parse("50000000-0000-0000-0000-000000000073")] = Guid.Parse("40000000-0000-0000-0000-000000000021"), // NTC_COPY_LICENSES -> NTC_1_21

        // Amateur Licenses sharing NTC 1-03 (Svc103Id = 20000000-0000-0000-0000-000000000003)
        [Guid.Parse("50000000-0000-0000-0000-000000000076")] = Guid.Parse("20000000-0000-0000-0000-000000000003"), // NTC_AMA_LICENSES -> NTC_1_03
        [Guid.Parse("50000000-0000-0000-0000-000000000012")] = Guid.Parse("20000000-0000-0000-0000-000000000003"), // Legacy SvcLicAmaId -> SvcLicAmaId (NTC 1-03)

        // TVRO CATV sharing NTC 1-22 (Svc122Id = 50000000-0000-0000-0000-000000000022)
        [Guid.Parse("50000000-0000-0000-0000-000000000075")] = Guid.Parse("50000000-0000-0000-0000-000000000022"), // NTC_TVRO_CATV_LICENSES -> NTC_1_22
        [Guid.Parse("50000000-0000-0000-0000-000000000016")] = Guid.Parse("50000000-0000-0000-0000-000000000022"), // Legacy NTC_TVRO_CATV_LICENSES -> NTC_1_22

        // Maritime License (SvcLicMarId = 50000000-0000-0000-0000-000000000072 - NTC 1-04)
        [Guid.Parse("50000000-0000-0000-0000-000000000013")] = Guid.Parse("50000000-0000-0000-0000-000000000072"), // Legacy SvcLicMarId -> SvcLicMarId (NTC 1-04)
    };

    public Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default) =>
        GetFormByServiceIdAsync(serviceId, null, null, cancellationToken);

    public async Task<Form?> GetFormByServiceIdAsync(
        Guid serviceId,
        Guid? serviceVariantId = null,
        string? formKey = null,
        CancellationToken cancellationToken = default)
    {
        var targetServiceId = ServiceToCanonicalServiceMap.TryGetValue(serviceId, out var canonicalId)
            ? canonicalId
            : serviceId;

        var allServiceForms = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .Where(f => (f.ServiceId == serviceId || f.ServiceId == targetServiceId) && !f.IsDeleted)
            .ToListAsync(cancellationToken);

        if (allServiceForms.Count == 0)
        {
            return null;
        }

        Form? selectedForm = null;

        // 1. If explicit formKey provided, try matching active form by key
        if (!string.IsNullOrWhiteSpace(formKey))
        {
            selectedForm = allServiceForms
                .Where(f => string.Equals(f.Key, formKey.Trim(), StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .ThenByDescending(f => f.IsActive)
                .FirstOrDefault();
        }

        // 2. If specific serviceVariantId provided, look for dedicated variant form
        if (selectedForm == null && serviceVariantId.HasValue && serviceVariantId.Value != Guid.Empty)
        {
            selectedForm = allServiceForms
                .Where(f => f.ServiceVariantId == serviceVariantId.Value)
                .OrderByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .ThenByDescending(f => f.IsActive)
                .FirstOrDefault();
        }

        // 3. Fallback to base form (ServiceVariantId == null && BaseFormId == null)
        if (selectedForm == null)
        {
            selectedForm = allServiceForms
                .Where(f => f.ServiceVariantId == null && f.BaseFormId == null)
                .OrderByDescending(f => f.ServiceId == serviceId)
                .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .ThenByDescending(f => f.IsActive)
                .FirstOrDefault();
        }

        // 4. Fallback to any base form for this service
        selectedForm ??= allServiceForms
            .Where(f => f.BaseFormId == null)
            .OrderByDescending(f => f.ServiceId == serviceId)
            .ThenByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
            .ThenByDescending(f => f.IsActive)
            .FirstOrDefault()
            ?? allServiceForms
                .OrderByDescending(f => f.LastModifiedAt ?? f.CreatedAt)
                .FirstOrDefault();

        if (selectedForm != null)
        {
            SynchronizeServiceFormFields(selectedForm, allServiceForms);
        }

        return selectedForm;
    }

    private static void SynchronizeServiceFormFields(Form selectedForm, IReadOnlyList<Form> allServiceForms)
    {
        if (selectedForm.Sections == null || allServiceForms.Count == 0) return;

        var allFieldEntries = allServiceForms
            .Where(f => f.Sections != null)
            .SelectMany(f => f.Sections.Where(s => !s.IsDeleted).SelectMany(s => (s.SectionFields ?? Enumerable.Empty<SectionField>())
                .Where(sf => sf.Field != null && !sf.Field.IsDeleted)
                .Select(sf => new
                {
                    Form = f,
                    SectionKey = s.Key ?? string.Empty,
                    SectionField = sf,
                    Field = sf.Field!,
                    Timestamp = sf.Field!.LastModifiedAt ?? f.LastModifiedAt ?? sf.Field!.CreatedAt
                })))
            .ToList();

        if (allFieldEntries.Count == 0) return;

        foreach (var section in selectedForm.Sections.Where(s => !s.IsDeleted))
        {
            if (section.SectionFields == null) continue;

            foreach (var sf in section.SectionFields)
            {
                if (sf.Field == null) continue;
                var labelTrimmed = (sf.Field.Label ?? string.Empty).Trim();
                if (labelTrimmed.Length == 0) continue;

                var newestMatch = allFieldEntries
                    .Where(e =>
                        e.Field.Id == sf.FieldId ||
                        string.Equals((e.Field.Label ?? string.Empty).Trim(), labelTrimmed, StringComparison.OrdinalIgnoreCase))
                    .OrderByDescending(e => e.Timestamp)
                    .ThenByDescending(e => !string.IsNullOrWhiteSpace(e.Field.ValidationRules) ? e.Field.ValidationRules!.Length : 0)
                    .FirstOrDefault();

                if (newestMatch != null && newestMatch.Field.Id != sf.Field.Id)
                {
                    var currentTs = sf.Field.LastModifiedAt ?? selectedForm.LastModifiedAt ?? sf.Field.CreatedAt;
                    if (newestMatch.Timestamp >= currentTs && !string.IsNullOrWhiteSpace(newestMatch.Field.ValidationRules))
                    {
                        sf.Field.ValidationRules = newestMatch.Field.ValidationRules;
                        if (!string.IsNullOrWhiteSpace(newestMatch.Field.FieldType))
                        {
                            sf.Field.FieldType = newestMatch.Field.FieldType;
                        }
                    }
                }
            }
        }
    }

    public async Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

        if (form != null && form.ServiceId != Guid.Empty)
        {
            var targetServiceId = ServiceToCanonicalServiceMap.TryGetValue(form.ServiceId, out var canonicalId)
                ? canonicalId
                : form.ServiceId;

            var siblingForms = await _context.Forms
                .IgnoreQueryFilters()
                .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                    .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                        .ThenInclude(sf => sf.Field)
                .Where(f => (f.ServiceId == form.ServiceId || f.ServiceId == targetServiceId) && !f.IsDeleted)
                .ToListAsync(cancellationToken);

            SynchronizeServiceFormFields(form, siblingForms);
        }

        return form;
    }

    public async Task<List<Form>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .Include(f => f.Service)
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
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
        // 1. Get or Create Form
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == formId, cancellationToken);

        if (form == null)
        {
            // If isActive is not explicitly provided, only activate if no active form exists for this service + variant yet.
            bool shouldBeActive = isActive ?? (!await _context.Forms.AnyAsync(f =>
                f.ServiceId == serviceId &&
                f.ServiceVariantId == serviceVariantId &&
                !f.IsDeleted &&
                f.IsActive, cancellationToken));

            var fallbackKey = !string.IsNullOrWhiteSpace(key)
                ? key.Trim()
                : (serviceVariantId.HasValue ? $"var_{serviceVariantId.Value}" : $"form_{formId}");

            form = new Form
            {
                Id = formId,
                ServiceId = serviceId,
                Key = fallbackKey,
                ServiceVariantId = serviceVariantId,
                BaseFormId = baseFormId,
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
            }
            if (baseFormId.HasValue)
            {
                form.BaseFormId = baseFormId.Value;
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

        // If this form is active, deactivate other versions strictly for the SAME scope
        if (form.IsActive)
        {
            var otherActiveFormsQuery = _context.Forms
                .Where(f => f.ServiceId == serviceId &&
                            f.Id != form.Id &&
                            !f.IsDeleted &&
                            f.IsActive);

            if (form.ServiceVariantId.HasValue && form.ServiceVariantId.Value != Guid.Empty)
            {
                // Variant form with ServiceVariantId: only deactivate other forms for the SAME variant!
                otherActiveFormsQuery = otherActiveFormsQuery.Where(f => f.ServiceVariantId == form.ServiceVariantId.Value);
            }
            else if (form.BaseFormId.HasValue && form.BaseFormId.Value != Guid.Empty)
            {
                // Variant form with BaseFormId (keyed variant): only deactivate other forms with the SAME Key!
                otherActiveFormsQuery = otherActiveFormsQuery.Where(f => f.BaseFormId == form.BaseFormId.Value && f.Key == form.Key);
            }
            else
            {
                // Master Base Form: ONLY deactivate other base forms (never deactivate variant forms!)
                otherActiveFormsQuery = otherActiveFormsQuery.Where(f => f.ServiceVariantId == null && f.BaseFormId == null);
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

        // 2. Upsert all Fields first
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
                existingField.Label = fDto.Label ?? string.Empty;
                existingField.FieldType = fDto.Type ?? "text";
                existingField.ValidationRules = fDto.ValidationRules;
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

        // Propagate updated field options/validationRules to sibling fields with the same label under the same service
        if (form.ServiceId != Guid.Empty && allFieldDtos.Count > 0)
        {
            var targetServiceId = ServiceToCanonicalServiceMap.TryGetValue(form.ServiceId, out var canonicalId)
                ? canonicalId
                : form.ServiceId;

            var siblingFieldIds = await _context.FormSections
                .IgnoreQueryFilters()
                .Where(s => !s.IsDeleted && s.Form != null && !s.Form.IsDeleted && (s.Form.ServiceId == form.ServiceId || s.Form.ServiceId == targetServiceId))
                .SelectMany(s => s.SectionFields.Select(sf => sf.FieldId))
                .Distinct()
                .ToListAsync(cancellationToken);

            if (siblingFieldIds.Count > 0)
            {
                var siblingFields = await _context.Fields
                    .IgnoreQueryFilters()
                    .Where(f => siblingFieldIds.Contains(f.Id) && !fieldIds.Contains(f.Id))
                    .ToListAsync(cancellationToken);

                // Use the last (most recently added/edited) field DTO per label
                var latestDtoByLabel = allFieldDtos
                    .Where(d => !string.IsNullOrWhiteSpace(d.Label))
                    .GroupBy(d => d.Label!.Trim(), StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(g => g.Key, g => g.Last(), StringComparer.OrdinalIgnoreCase);

                foreach (var sib in siblingFields)
                {
                    var sibLabel = (sib.Label ?? string.Empty).Trim();
                    if (sibLabel.Length > 0 && latestDtoByLabel.TryGetValue(sibLabel, out var matchingDto))
                    {
                        if (!string.IsNullOrWhiteSpace(matchingDto.ValidationRules))
                        {
                            sib.ValidationRules = matchingDto.ValidationRules;
                        }
                        if (!string.IsNullOrWhiteSpace(matchingDto.Type))
                        {
                            sib.FieldType = matchingDto.Type!;
                        }
                        sib.LastModifiedAt = DateTime.UtcNow;
                    }
                }
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

        var usedSectionKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
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

            if (existingSectionsByKey.TryGetValue(uniqueKey, out var existingSec))
            {
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
            foreach (var fDto in secDto.Fields ?? new List<FormFieldDto>())
            {
                if (fDto.FieldId == Guid.Empty || seenFieldIdsInSec.Contains(fDto.FieldId))
                {
                    continue;
                }
                seenFieldIdsInSec.Add(fDto.FieldId);

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

        var otherActiveFormsQuery = _context.Forms
            .Where(f => f.ServiceId == form.ServiceId &&
                        f.Id != form.Id &&
                        !f.IsDeleted &&
                        f.IsActive);

        if (form.ServiceVariantId.HasValue && form.ServiceVariantId.Value != Guid.Empty)
        {
            otherActiveFormsQuery = otherActiveFormsQuery.Where(f => f.ServiceVariantId == form.ServiceVariantId.Value);
        }
        else if (form.BaseFormId.HasValue && form.BaseFormId.Value != Guid.Empty)
        {
            otherActiveFormsQuery = otherActiveFormsQuery.Where(f => f.BaseFormId == form.BaseFormId.Value && f.Key == form.Key);
        }
        else
        {
            otherActiveFormsQuery = otherActiveFormsQuery.Where(f => f.ServiceVariantId == null && f.BaseFormId == null);
        }

        var otherActiveForms = await otherActiveFormsQuery.ToListAsync(cancellationToken);

        foreach (var other in otherActiveForms)
        {
            other.IsActive = false;
            other.LastModifiedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return form;
    }

    public async Task<List<Form>> GetVersionsByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.ServiceVariant)
            .Include(f => f.BaseForm)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted))
                .ThenInclude(fs => fs.SectionFields)
            .Where(f => f.ServiceId == serviceId && !f.IsDeleted)
            .OrderByDescending(f => f.IsActive)
            .ThenByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Form?> GetActiveVariantFormAsync(Guid variantId, CancellationToken cancellationToken = default)
    {
        return await _context.Forms
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
    }

    public async Task<bool> RevertVariantFormAsync(Guid variantId, CancellationToken cancellationToken = default)
    {
        var variantForms = await _context.Forms
            .IgnoreQueryFilters()
            .Where(f => f.ServiceVariantId == variantId && !f.IsDeleted)
            .ToListAsync(cancellationToken);

        if (variantForms.Count == 0) return true;

        foreach (var form in variantForms)
        {
            form.IsDeleted = true;
            form.IsActive = false;
            form.LastModifiedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> SetVariantFormActiveAsync(Guid variantId, bool isActive, CancellationToken cancellationToken = default)
    {
        var variantForms = await _context.Forms
            .IgnoreQueryFilters()
            .Where(f => f.ServiceVariantId == variantId && !f.IsDeleted)
            .ToListAsync(cancellationToken);

        if (variantForms.Count == 0) return false;

        foreach (var form in variantForms)
        {
            form.IsActive = isActive;
            form.LastModifiedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
