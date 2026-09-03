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

        if (targetForm == null)
        {
            targetForm = new Form
            {
                Id = formId,
                ServiceId = service.Id,
                Version = "1.0",
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

        var desiredKeys = deduplicatedSections.Select(s => s.Key.Trim()).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var obsoleteSections = existingSections.Where(s => !desiredKeys.Contains((s.Key ?? string.Empty).Trim())).ToList();
        if (obsoleteSections.Count > 0)
        {
            var obsoleteSecIds = obsoleteSections.Select(s => s.Id).ToList();
            var obsoleteFields = await context.SectionFields
                .Where(sf => obsoleteSecIds.Contains(sf.FormSectionId))
                .ToListAsync();
            if (obsoleteFields.Count > 0) context.SectionFields.RemoveRange(obsoleteFields);
            context.FormSections.RemoveRange(obsoleteSections);
            await context.SaveChangesAsync();
            foreach (var obs in obsoleteSections) existingSections.Remove(obs);
        }

        int sectionOrder = 1;
        foreach (var (rawKey, title, fieldKeys) in deduplicatedSections)
        {
            var key = rawKey.Trim();
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
            if (currentFields.Count > 0)
            {
                context.SectionFields.RemoveRange(currentFields);
                await context.SaveChangesAsync();
            }

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
