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

    private static readonly Dictionary<Guid, Guid> ServiceToCanonicalServiceMap = new()
    {
        // Permits sharing NTC 1-09 (Svc109Id = 50000000-0000-0000-0000-000000000009)
        [Guid.Parse("50000000-0000-0000-0000-000000000061")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_AERO_PERMITS -> NTC_1_09
        [Guid.Parse("50000000-0000-0000-0000-000000000062")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_MAR_PERMITS -> NTC_1_09
        [Guid.Parse("50000000-0000-0000-0000-000000000063")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_FLM_PERMITS -> NTC_1_09
        [Guid.Parse("50000000-0000-0000-0000-000000000064")] = Guid.Parse("50000000-0000-0000-0000-000000000009"), // NTC_PTE_PERMITS -> NTC_1_09

        // Equipment / Mobile Phone sharing NTC 1-14 (SvcEquipId = 50000000-0000-0000-0000-000000000065)
        [Guid.Parse("50000000-0000-0000-0000-000000000066")] = Guid.Parse("50000000-0000-0000-0000-000000000065"), // NTC_MP_PERMITS -> NTC_EQUIP_PERMITS

        // Copy of Permits and Copy of Certificates sharing NTC 1-05 / 1-21 (SvcLicCopyId = 50000000-0000-0000-0000-000000000017)
        [Guid.Parse("50000000-0000-0000-0000-000000000067")] = Guid.Parse("50000000-0000-0000-0000-000000000017"), // NTC_COPY_PERMITS -> NTC_COPY_LICENSES
        [Guid.Parse("50000000-0000-0000-0000-000000000021")] = Guid.Parse("50000000-0000-0000-0000-000000000017"), // NTC_1_21 (Copy of Certificates) -> NTC_COPY_LICENSES

        // Licenses sharing NTC 1-11 (SvcLicFlmId = 50000000-0000-0000-0000-000000000014)
        [Guid.Parse("50000000-0000-0000-0000-000000000011")] = Guid.Parse("50000000-0000-0000-0000-000000000014"), // NTC_AMA_LICENSES -> NTC_FLM_LICENSES
        [Guid.Parse("50000000-0000-0000-0000-000000000012")] = Guid.Parse("50000000-0000-0000-0000-000000000014"), // NTC_AERO_LICENSES -> NTC_FLM_LICENSES
        [Guid.Parse("50000000-0000-0000-0000-000000000015")] = Guid.Parse("50000000-0000-0000-0000-000000000014"), // NTC_OTHER_LICENSES -> NTC_FLM_LICENSES

        // TVRO CATV sharing NTC 1-22 (Svc122Id = 50000000-0000-0000-0000-000000000022)
        [Guid.Parse("50000000-0000-0000-0000-000000000016")] = Guid.Parse("50000000-0000-0000-0000-000000000022"), // NTC_TVRO_CATV_LICENSES -> NTC_1_22

        // Requests / Complaints sharing NTC_REQ_COMPLAINTS (SvcReqComplaintsId = 50000000-0000-0000-0000-000000000025)
        [Guid.Parse("50000000-0000-0000-0000-000000000024")] = Guid.Parse("50000000-0000-0000-0000-000000000025"), // NTC_1_24 -> NTC_REQ_COMPLAINTS
        [Guid.Parse("50000000-0000-0000-0000-000000000026")] = Guid.Parse("50000000-0000-0000-0000-000000000025"), // NTC_1_25 -> NTC_REQ_COMPLAINTS
    };

    public async Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        var targetServiceId = ServiceToCanonicalServiceMap.TryGetValue(serviceId, out var canonicalId)
            ? canonicalId
            : serviceId;

        return await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .Where(f => (f.ServiceId == serviceId || f.ServiceId == targetServiceId) && !f.IsDeleted)
            .OrderByDescending(f => f.ServiceId == serviceId)
            .ThenByDescending(f => f.IsActive)
            .ThenByDescending(f => f.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted).OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<List<Form>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .Include(f => f.Service)
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
        CancellationToken cancellationToken = default)
    {
        // 1. Get or Create Form
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == formId, cancellationToken);

        if (form == null)
        {
            // If isActive is not explicitly provided, only activate if no active form exists for this service yet.
            // This prevents newly created forms (such as v2 drafts) from immediately usurping the live client form.
            bool shouldBeActive = isActive ?? (!await _context.Forms.AnyAsync(f => f.ServiceId == serviceId && !f.IsDeleted && f.IsActive, cancellationToken));

            form = new Form
            {
                Id = formId,
                ServiceId = serviceId,
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

        // If this form is active, deactivate other forms for the same service
        if (form.IsActive)
        {
            var otherActiveForms = await _context.Forms
                .Where(f => f.ServiceId == serviceId && f.Id != form.Id && !f.IsDeleted && f.IsActive)
                .ToListAsync(cancellationToken);
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

        var otherActiveForms = await _context.Forms
            .Where(f => f.ServiceId == form.ServiceId && f.Id != form.Id && !f.IsDeleted && f.IsActive)
            .ToListAsync(cancellationToken);

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
            .Include(f => f.Sections.Where(fs => !fs.IsDeleted))
                .ThenInclude(fs => fs.SectionFields)
            .Where(f => f.ServiceId == serviceId && !f.IsDeleted)
            .OrderByDescending(f => f.IsActive)
            .ThenByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
