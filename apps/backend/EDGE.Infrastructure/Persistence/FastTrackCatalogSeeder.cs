using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Persistence;

/// <summary>
/// Handles seeding and backfilling of Services, Elements, Notes, Requirements, Fees, and Schedules.
/// </summary>
public static class FastTrackCatalogSeeder
{
    public static async Task BackfillNewServicesAsync(ApplicationDbContext context)
    {
        var tenant = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync();
        if (tenant == null) return;

        var existingCategories = await context.ServiceCategories.IgnoreQueryFilters().ToListAsync();
        var categoryIds = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

        void AddCategoryMapping(string key, ServiceCategoryType type)
        {
            var cat = existingCategories.FirstOrDefault(c => c.Type == type);
            if (cat != null) categoryIds[key] = cat.Id;
        }

        AddCategoryMapping("Exams", ServiceCategoryType.Exam);
        AddCategoryMapping("Certificates", ServiceCategoryType.Certificate);
        AddCategoryMapping("Licenses", ServiceCategoryType.License);
        AddCategoryMapping("Permits", ServiceCategoryType.Permit);
        AddCategoryMapping("Accreditations", ServiceCategoryType.Accreditation);
        AddCategoryMapping("RequestsAndComplaints", ServiceCategoryType.RequestsAndComplaints);

        foreach (var key in new[] { "Exams", "Certificates", "Licenses", "Permits", "Accreditations", "RequestsAndComplaints" })
        {
            if (!categoryIds.ContainsKey(key))
            {
                categoryIds[key] = key switch
                {
                    "Exams" => Guid.Parse("c0000000-0000-0000-0000-000000000001"),
                    "Certificates" => Guid.Parse("c0000000-0000-0000-0000-000000000002"),
                    "Licenses" => Guid.Parse("c0000000-0000-0000-0000-000000000003"),
                    "Permits" => Guid.Parse("c0000000-0000-0000-0000-000000000004"),
                    "Accreditations" => Guid.Parse("c0000000-0000-0000-0000-000000000005"),
                    _ => Guid.Parse("c0000000-0000-0000-0000-000000000006")
                };
            }
        }

        var serviceDefs = FastTrackSeederData.GetServiceDefs(categoryIds);
        var existingServices = await context.Services.IgnoreQueryFilters().ToListAsync();
        var targetIds = serviceDefs.Select(d => d.Id).ToHashSet();

        // 1. Self-heal and disambiguate any existing services whose Code would collide with a target def but have a different Id.
        // In PostgreSQL, IX_Services_Code enforces uniqueness across all rows (including soft-deleted ones).
        bool codeConflictResolved = false;
        foreach (var def in serviceDefs)
        {
            var conflictingServices = existingServices
                .Where(x => string.Equals(x.Code, def.Code, StringComparison.OrdinalIgnoreCase) && x.Id != def.Id)
                .ToList();

            foreach (var conflict in conflictingServices)
            {
                conflict.Code = $"{def.Code}_LEGACY_{conflict.Id:N}";
                conflict.IsDeleted = true;
                conflict.IsDeletedBy = "System";
                codeConflictResolved = true;
            }
        }

        if (codeConflictResolved)
        {
            await context.SaveChangesAsync();
        }

        // 2. Upsert target services by deterministic Id
        bool anyChange = false;
        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Id == def.Id);

            if (s == null)
            {
                s = new Service
                {
                    Id = def.Id,
                    ServiceCategoryId = def.CategoryId,
                    TenantId = null,
                    Name = def.Name,
                    Group = def.Group,
                    Code = def.Code,
                    Description = def.Desc,
                    Contract = def.Contract
                };
                context.Services.Add(s);
                existingServices.Add(s);
                anyChange = true;
            }
            else
            {
                if (s.IsDeleted || s.Code != def.Code || s.Name != def.Name || s.Group != def.Group || s.ServiceCategoryId != def.CategoryId || s.Description != def.Desc || s.Contract != def.Contract || s.TenantId != null)
                {
                    s.IsDeleted = false;
                    s.IsDeletedBy = string.Empty;
                    s.Code = def.Code;
                    s.Name = def.Name;
                    s.Group = def.Group;
                    s.Description = def.Desc;
                    s.ServiceCategoryId = def.CategoryId;
                    s.Contract = def.Contract;
                    s.TenantId = null;
                    anyChange = true;
                }
            }
        }

        // 3. Mark any obsolete non-target services as deleted
        var obsoleteServices = existingServices
            .Where(x => !targetIds.Contains(x.Id) && !x.IsDeleted && x.Code?.Contains("_LEGACY_") != true)
            .ToList();

        foreach (var obs in obsoleteServices)
        {
            obs.IsDeleted = true;
            obs.IsDeletedBy = "System";
            anyChange = true;
        }

        if (anyChange)
            await context.SaveChangesAsync();

        // 4. Safely clean up unreferenced legacy services where foreign keys permit
        try
        {
            var legacyServices = existingServices
                .Where(x => x.Code?.Contains("_LEGACY_") == true)
                .ToList();

            if (legacyServices.Count > 0)
            {
                var legacyIds = legacyServices.Select(x => x.Id).ToList();
                var servicesWithApps = (await context.Applicants.IgnoreQueryFilters()
                    .Where(a => a.ServiceId.HasValue && legacyIds.Contains(a.ServiceId.Value))
                    .Select(a => a.ServiceId!.Value)
                    .ToListAsync())
                    .ToHashSet();

                var toRemove = legacyServices.Where(x => !servicesWithApps.Contains(x.Id)).ToList();
                if (toRemove.Count > 0)
                {
                    var toRemoveIds = toRemove.Select(x => x.Id).ToList();
                    var variantsToRemove = await context.ServiceVariants.IgnoreQueryFilters()
                        .Where(v => toRemoveIds.Contains(v.ServiceId))
                        .ToListAsync();
                    if (variantsToRemove.Count > 0)
                    {
                        var varIds = variantsToRemove.Select(v => v.Id).ToList();
                        var hasVarApps = await context.Applicants.IgnoreQueryFilters()
                            .AnyAsync(a => a.ServiceVariantId.HasValue && varIds.Contains(a.ServiceVariantId.Value));
                        if (!hasVarApps)
                        {
                            context.ServiceVariants.RemoveRange(variantsToRemove);
                        }
                    }

                    var formsToRemove = await context.Forms.IgnoreQueryFilters()
                        .Where(f => toRemoveIds.Contains(f.ServiceId))
                        .ToListAsync();
                    if (formsToRemove.Count > 0)
                    {
                        context.Forms.RemoveRange(formsToRemove);
                    }

                    context.Services.RemoveRange(toRemove);
                    await context.SaveChangesAsync();
                }
            }
        }
        catch
        {
            // If physical delete fails due to database foreign keys, rows are already safely marked IsDeleted = true with unique _LEGACY_ codes.
        }
    }

    public static async Task BackfillNewCatalogDetailsAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        var svc101 = Guid.Parse("50000000-0000-0000-0000-000000000001");
        var allVariantsInDb = await context.ServiceVariants.IgnoreQueryFilters().AsNoTracking().ToListAsync();
        var validVariantIds = allVariantsInDb.Select(v => v.Id).ToHashSet();
        var allVariantsByDef = FastTrackSeederData.GetVariantDefs();

        Guid ResolveVariantId(Guid hardcodedVariantId)
        {
            var matchingById = allVariantsInDb.FirstOrDefault(v => v.Id == hardcodedVariantId);
            if (matchingById != null) return matchingById.Id;

            var def = allVariantsByDef.FirstOrDefault(d => d.Id == hardcodedVariantId);
            if (def != default)
            {
                var matchingDbVariant = allVariantsInDb.FirstOrDefault(v =>
                    v.ServiceId == def.ServiceId && v.Type == def.Type &&
                    (string.IsNullOrEmpty(def.Description) || v.Description == def.Description));
                if (matchingDbVariant != null) return matchingDbVariant.Id;
            }
            return hardcodedVariantId;
        }

        // 1. Seed Elements
        var elementsToSeed = FastTrackSeederData.GetBackfillElements();
        var allDbSve = await context.ServiceVariantElements.IgnoreQueryFilters().ToListAsync();
        var desiredElements = new List<(Guid VariantId, string Code, string Description)>();
        foreach (var el in elementsToSeed)
        {
            Guid actualVariantId = ResolveVariantId(el.VariantId);
            if (validVariantIds.Contains(actualVariantId))
                desiredElements.Add((actualVariantId, el.Code, el.Description));
        }

        bool anySveChange = false;
        foreach (var (variantId, code, desc) in desiredElements)
        {
            var existingEl = allDbSve.FirstOrDefault(e => e.ServiceVariantId == variantId && e.Code == code && e.Description == desc);
            if (existingEl == null)
            {
                var createdSve = new ServiceVariantElement { Id = Guid.NewGuid(), ServiceVariantId = variantId, Code = code, Description = desc };
                context.ServiceVariantElements.Add(createdSve);
                allDbSve.Add(createdSve);
                anySveChange = true;
            }
            else if (existingEl.IsDeleted)
            {
                existingEl.IsDeleted = false;
                existingEl.IsDeletedBy = string.Empty;
                anySveChange = true;
            }
        }
        if (anySveChange)
        {
            await context.SaveChangesAsync();
        }

        // 2. Master Elements
        var uniqueElementCodes = elementsToSeed.GroupBy(e => e.Code, StringComparer.OrdinalIgnoreCase).Select(g => g.First()).ToList();
        var existingElements = (await context.Elements.IgnoreQueryFilters().AsNoTracking().Select(e => e.Code.ToLower()).ToListAsync()).ToHashSet();
        bool anyMasterElementChange = false;
        foreach (var el in uniqueElementCodes)
        {
            if (existingElements.Add(el.Code.ToLower()))
            {
                context.Elements.Add(new Element { Id = Guid.NewGuid(), Code = el.Code.ToUpper(), Name = el.Code, Description = el.Description });
                anyMasterElementChange = true;
            }
        }
        if (anyMasterElementChange)
        {
            await context.SaveChangesAsync();
        }

        // 3. Notes
        var notesToSeed = FastTrackSeederData.GetBackfillNotes(svc101);
        var existingNotesList = await context.ServiceNotes.IgnoreQueryFilters().ToListAsync();
        bool anyNoteChange = false;
        foreach (var note in notesToSeed)
        {
            Guid? actualVariantId = note.ServiceVariantId.HasValue ? ResolveVariantId(note.ServiceVariantId.Value) : null;
            if (actualVariantId.HasValue && !validVariantIds.Contains(actualVariantId.Value)) actualVariantId = null;

            var matchingNote = existingNotesList.FirstOrDefault(n => n.ServiceId == note.ServiceId && n.ServiceVariantId == actualVariantId && n.Notes == note.Content);
            if (matchingNote == null)
            {
                var createdNote = new ServiceNote { Id = Guid.NewGuid(), ServiceId = note.ServiceId, ServiceVariantId = actualVariantId, Notes = note.Content };
                context.ServiceNotes.Add(createdNote);
                existingNotesList.Add(createdNote);
                anyNoteChange = true;
            }
            else if (matchingNote.IsDeleted)
            {
                matchingNote.IsDeleted = false;
                matchingNote.IsDeletedBy = string.Empty;
                anyNoteChange = true;
            }
        }
        if (anyNoteChange)
        {
            await context.SaveChangesAsync();
        }

        // 4. Requirements & Bindings
        var reqs = FastTrackSeederData.GetBackfillRequirements();
        var existingRequirements = await context.Requirements.IgnoreQueryFilters().ToListAsync();
        var existingReqMap = existingRequirements.ToDictionary(r => r.Id);
        bool anyReqChange = false;
        foreach (var req in reqs.Values)
        {
            if (!existingReqMap.TryGetValue(req.Id, out var existing))
            {
                var newReq = new Requirement { Id = req.Id, Name = req.Name, Description = req.Desc };
                context.Requirements.Add(newReq);
                existingReqMap[req.Id] = newReq;
                anyReqChange = true;
            }
            else
            {
                if (existing.IsDeleted || existing.Name != req.Name || existing.Description != req.Desc)
                {
                    existing.IsDeleted = false;
                    existing.IsDeletedBy = string.Empty;
                    existing.Name = req.Name;
                    existing.Description = req.Desc;
                    anyReqChange = true;
                }
            }
        }
        if (anyReqChange)
        {
            await context.SaveChangesAsync();
        }

        var tenantId = await context.Tenants.IgnoreQueryFilters().Select(t => (Guid?)t.Id).FirstOrDefaultAsync();
        var variantReqsToSeed = FastTrackSeederData.GetBackfillVariantRequirements();
        var allExistingSvr = await context.ServiceVariantRequirements.IgnoreQueryFilters().ToListAsync();
        var baseTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        int seedIndex = 0;
        bool anySvrChange = false;

        foreach (var vr in variantReqsToSeed)
        {
            seedIndex++;
            Guid actualVariantId = ResolveVariantId(vr.VariantId);
            if (!validVariantIds.Contains(actualVariantId) || !existingReqMap.ContainsKey(vr.ReqId)) continue;

            var existingRecord = allExistingSvr.FirstOrDefault(r => r.ServiceVariantId == actualVariantId && r.RequirementId == vr.ReqId);
            var targetCreatedAt = baseTime.AddSeconds(seedIndex);
            if (existingRecord == null)
            {
                var newSvr = new ServiceVariantRequirement { Id = Guid.NewGuid(), TenantId = tenantId, ServiceVariantId = actualVariantId, RequirementId = vr.ReqId, IsRequired = vr.IsRequired, CreatedAt = targetCreatedAt };
                context.ServiceVariantRequirements.Add(newSvr);
                allExistingSvr.Add(newSvr);
                anySvrChange = true;
            }
            else
            {
                if (existingRecord.IsDeleted || existingRecord.IsRequired != vr.IsRequired)
                {
                    existingRecord.IsDeleted = false;
                    existingRecord.IsDeletedBy = string.Empty;
                    existingRecord.IsRequired = vr.IsRequired;
                    anySvrChange = true;
                }
            }
        }
        if (anySvrChange)
        {
            await context.SaveChangesAsync();
        }

        // 5. Seed ServiceVariantFees and ServiceVariantElementFees
        await FastTrackFeeSeeder.SeedFeesAndVariantFeesAsync(context, logger);
    }
}
