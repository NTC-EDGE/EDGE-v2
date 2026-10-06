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

    public async Task<Form?> GetFormByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.Sections.OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.ServiceId == serviceId, cancellationToken);
    }

    public async Task<Form?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .IgnoreQueryFilters()
            .Include(f => f.Service)
            .Include(f => f.Sections.OrderBy(fs => fs.OrderIndex))
                .ThenInclude(fs => fs.SectionFields.OrderBy(sf => sf.OrderIndex))
                    .ThenInclude(sf => sf.Field)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<List<Form>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Forms
            .Include(f => f.Service)
            .Include(f => f.Sections)
                .ThenInclude(fs => fs.SectionFields)
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
        CancellationToken cancellationToken = default)
    {
        // 1. Get or Create Form
        var form = await _context.Forms
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == formId, cancellationToken);

        if (form == null)
        {
            form = new Form
            {
                Id = formId,
                ServiceId = serviceId,
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
            form.Version = string.IsNullOrWhiteSpace(version) ? "1.0" : version;
            form.CategorySelectionRequired = categorySelectionRequired;
            form.IsDeleted = false;
            form.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
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
}
