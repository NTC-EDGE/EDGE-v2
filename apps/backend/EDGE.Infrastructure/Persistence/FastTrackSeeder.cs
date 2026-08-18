using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using static EDGE.Infrastructure.Persistence.ServiceInformationDataSeeder;

namespace EDGE.Infrastructure.Persistence;

public static class FastTrackSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Skip the full initial seed if services are already present.
        // However, always run the contract-update pass below so that changes to
        // requirementDiscriminatorFields / requirementContextGroups in the contract
        // JSON strings are applied to existing rows without needing a full re-seed.
        bool skipInitialSeed = await context.Services.CountAsync() >= 12;
        if (skipInitialSeed)
        {
            await UpdateContractsAsync(context);
            await BackfillNewServicesAsync(context);      // 1. Seed new Services first (so variants FK matches)
            await UpdateVariantsAsync(context);          // 2. Update/upsert all variants
            await BackfillNewCatalogDetailsAsync(context); // 3. Backfill elements, notes, requirements, and fees
            await ServiceInformationDataSeeder.SeedAsync(context);  // 4. Seed ServiceInformations entity records
            await SeedFormsInternalAsync(context);       // 5. Seed Form layouts
            return;
        }

        var tenant = await context.Tenants.FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Tenant not seeded. Run RolePermissionDataSeeder first.");

        // 1. Seed Service Categories (matching spec)
        var categories = new Dictionary<string, ServiceCategory>();
        var existingCategories = await context.ServiceCategories.ToListAsync();

        ServiceCategory GetOrAddCategory(string key, string name, string code, ServiceCategoryType type, Guid defaultId)
        {
            var existing = existingCategories.FirstOrDefault(c => c.Code == code || c.Type == type);
            if (existing != null)
                return existing;

            var cat = new ServiceCategory { Id = defaultId, Name = name, Code = code, Type = type };
            context.ServiceCategories.Add(cat);
            return cat;
        }

        categories["Exams"] = GetOrAddCategory("Exams", "Exams", "EXAM", ServiceCategoryType.Exam, Guid.Parse("c0000000-0000-0000-0000-000000000001"));
        categories["Certificates"] = GetOrAddCategory("Certificates", "Certificates", "CERT", ServiceCategoryType.Certificate, Guid.Parse("c0000000-0000-0000-0000-000000000002"));
        categories["Licenses"] = GetOrAddCategory("Licenses", "Licenses", "LIC", ServiceCategoryType.License, Guid.Parse("c0000000-0000-0000-0000-000000000003"));
        categories["Permits"] = GetOrAddCategory("Permits", "Permits", "PRM", ServiceCategoryType.Permit, Guid.Parse("c0000000-0000-0000-0000-000000000004"));
        categories["Accreditations"] = GetOrAddCategory("Accreditations", "Accreditations", "ACCR", ServiceCategoryType.Accreditation, Guid.Parse("c0000000-0000-0000-0000-000000000005"));
        categories["RequestsAndComplaints"] = GetOrAddCategory("RequestsAndComplaints", "Requests and Complaints", "REQ", ServiceCategoryType.RequestsAndComplaints, Guid.Parse("c0000000-0000-0000-0000-000000000006"));

        await context.SaveChangesAsync();

        // Seed Master Fee Entities
        if (!await context.Fees.AnyAsync())
        {
            context.Fees.AddRange(new[]
            {
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000001"), Code = "FILING_FEE", Name = "Filing & Application Processing Fee", Description = "Standard mandatory filing fee charged upon submission of application documents.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000002"), Code = "INSP_FEE", Name = "Technical Site Inspection Fee", Description = "On-site technical evaluation and radio station inspection fee.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000003"), Code = "LIC_RIGHTS_FEE", Name = "Spectrum & License Rights Fee", Description = "Radio frequency spectrum rights and operational permit fee.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000004"), Code = "PERMIT_ISSUE_FEE", Name = "Permit & Certificate Issuance Fee", Description = "Official document printing and certificate issuance charge.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000005"), Code = "EXAM_REG_FEE", Name = "Operator Competency Exam Fee", Description = "Registration fee for commercial and amateur radio operator examinations.", IsActive = true },
                new Fee { Id = Guid.Parse("f0000000-0000-0000-0000-000000000006"), Code = "SURCHARGE_LATE_FEE", Name = "Late Filing Surcharge & Penalty", Description = "Administrative surcharge penalty for late permit renewal applications.", IsActive = true }
            });
            await context.SaveChangesAsync();
        }

        // 3. Seed Services dictionary with correct names & categories
        var categoryIds = categories.ToDictionary(kv => kv.Key, kv => kv.Value.Id);
        var serviceDefs = FastTrackSeederData.GetServiceDefs(categoryIds);

        var services = new Dictionary<string, Service>();
        var existingServices = await context.Services.ToListAsync();

        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Code == def.Code);
            if (s != null && s.Id != def.Id)
            {
                context.Services.Remove(s);
                await context.SaveChangesAsync();
                s = null;
            }

            if (s == null)
            {
                s = new Service
                {
                    Id = def.Id,
                    ServiceCategoryId = def.CategoryId,
                    TenantId = tenant.Id,
                    Name = def.Name,
                    Group = def.Group,
                    Code = def.Code,
                    Description = def.Desc,
                    Contract = def.Contract
                };
                context.Services.Add(s);
            }
            else
            {
                s.Name = def.Name;
                s.Group = def.Group;
                s.ServiceCategoryId = def.CategoryId;
                s.Contract = def.Contract;
            }
            services[def.Key] = s;
        }

        await context.SaveChangesAsync();

        // Seed new services (so variants FK matches)
        await BackfillNewServicesAsync(context);

        // 4. Seed Service Variants
        await UpdateVariantsAsync(context);

        // 5. Backfill elements, notes, requirements, and fees
        await BackfillNewCatalogDetailsAsync(context);

        await context.SaveChangesAsync();

        await SeedFormsInternalAsync(context);
    }

    private static async Task SeedFormsInternalAsync(ApplicationDbContext context)
    {
        // 7. Seed Central Reusable Fields Pool (Deterministic GUIDs)
        var fieldsPool = FastTrackSeederData.GetFieldsPool();

        var existingFields = await context.Fields.ToListAsync();
        foreach (var f in fieldsPool.Values)
        {
            var existing = existingFields.FirstOrDefault(x => x.Id == f.Id);
            if (existing == null)
            {
                context.Fields.Add(f);
            }
            else if (existing.Label != f.Label || existing.FieldType != f.FieldType || existing.SyncBackOnSubmit != f.SyncBackOnSubmit)
            {
                existing.Label = f.Label;
                existing.FieldType = f.FieldType;
                existing.SyncBackOnSubmit = f.SyncBackOnSubmit;
            }
        }
        await context.SaveChangesAsync();

        // 8. Seed Form Builders & Sections per Service
        var existingForms = await context.Forms.AsNoTracking().Select(f => f.ServiceId).ToListAsync();
        var services = new Dictionary<string, Service>();

        async Task SeedFormForService(string serviceKey, Guid formId, Guid sectionGuidPrefix, List<(string Key, string Title, List<string> FieldKeys)> sectionDefs)
        {
            if (!services.TryGetValue(serviceKey, out var service))
            {
                service = await context.Services.FirstOrDefaultAsync(s => s.Code == serviceKey);
                if (service == null) return;
                services[serviceKey] = service;
            }

            // 1. Query all forms associated with this service
            var formsForService = await context.Forms
                .Where(f => f.ServiceId == service.Id)
                .ToListAsync();

            var formIdsForService = formsForService.Select(f => f.Id).ToList();

            // 2. Fetch and purge all existing SectionFields and FormSections across all forms for this service
            if (formIdsForService.Count > 0)
            {
                var existingSections = await context.FormSections
                    .Where(s => formIdsForService.Contains(s.FormId))
                    .ToListAsync();

                if (existingSections.Count > 0)
                {
                    var existingSectionIds = existingSections.Select(s => s.Id).ToList();
                    var existingSectionFields = await context.SectionFields
                        .Where(sf => existingSectionIds.Contains(sf.FormSectionId))
                        .ToListAsync();

                    if (existingSectionFields.Count > 0)
                    {
                        context.SectionFields.RemoveRange(existingSectionFields);
                    }
                    context.FormSections.RemoveRange(existingSections);
                    await context.SaveChangesAsync();
                }
            }

            // 3. Ensure exactly one Form exists for this service
            Form targetForm;
            if (formsForService.Count == 0)
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
                targetForm = formsForService[0];
                if (formsForService.Count > 1)
                {
                    context.Forms.RemoveRange(formsForService.Skip(1));
                    await context.SaveChangesAsync();
                }
            }

            // 4. Insert fresh sections matching sectionDefs
            int sectionOrder = 1;
            foreach (var (key, title, fieldKeys) in sectionDefs)
            {
                var newSection = new FormSection
                {
                    Id = Guid.NewGuid(),
                    FormId = targetForm.Id,
                    Key = key,
                    Title = title,
                    OrderIndex = sectionOrder++
                };
                context.FormSections.Add(newSection);
                await context.SaveChangesAsync();

                int fieldOrder = 1;
                foreach (var fk in fieldKeys)
                {
                    if (fieldsPool.TryGetValue(fk, out var f))
                    {
                        context.SectionFields.Add(new SectionField
                        {
                            FormSectionId = newSection.Id,
                            FieldId = f.Id,
                            IsRequired = key != "assistanceRequest" && key != "knownByAnotherName" && key != "club" && key != "examination" && key != "radioOfficers" && key != "payment",
                            OrderIndex = fieldOrder++
                        });
                    }
                }
                await context.SaveChangesAsync();
            }
        }

        // Seed Forms per NTC Service (defined modularly in service category seeders)
        var formDefs = FastTrackSeederData.GetAllFormDefs();
        foreach (var formDef in formDefs)
        {
            await SeedFormForService(
                formDef.ServiceKey,
                formDef.FormId,
                formDef.SectionGuidPrefix,
                formDef.Sections.Select(s => (s.Key, s.Title, s.FieldKeys)).ToList()
            );
        }
    }

    /// <summary>
    /// Applies the current contract JSON definitions to existing Service rows.
    /// Called on every startup so that changes to requirementDiscriminatorFields,
    /// requirementContextGroups, or any other contract metadata are reflected in
    /// the DB without requiring a full re-seed or manual SQL update.
    /// </summary>
    private static async Task UpdateContractsAsync(ApplicationDbContext context)
    {
        var services = await context.Services
            .Where(s => s.Code != null)
            .ToListAsync();

        if (services.Count == 0)
            return;

        var contractMap = FastTrackSeederData.GetContractMap();

        bool anyChange = false;
        foreach (var service in services)
        {
            if (service.Code == null)
                continue;

            // Normalize underscores vs hyphens
            var key = service.Code.Replace("-", "_").ToUpperInvariant();
            if (!contractMap.TryGetValue(key, out var newContract))
                continue;

            var normalizedNew     = newContract.Trim();
            var normalizedCurrent = (service.Contract ?? string.Empty).Trim();
            if (normalizedCurrent == normalizedNew)
                continue;

            service.Contract = newContract;
            anyChange = true;
        }

        if (anyChange)
            await context.SaveChangesAsync();
    }

    private static async Task UpdateVariantsAsync(ApplicationDbContext context)
    {
        var existingVariants = await context.ServiceVariants.ToListAsync();
        var variantDefs = FastTrackSeederData.GetVariantDefs();
        var variantDefIds = variantDefs.Select(d => d.Id).ToHashSet();
        
        bool anyChange = false;

        // Clean up and remove variants no longer defined in seeder
        var obsoleteVariantIds = existingVariants
            .Where(ev => !variantDefIds.Contains(ev.Id))
            .Select(ev => ev.Id)
            .ToList();

        if (obsoleteVariantIds.Count > 0)
        {
            var obsoleteSvr = await context.ServiceVariantRequirements
                .Where(r => obsoleteVariantIds.Contains(r.ServiceVariantId))
                .ToListAsync();
            if (obsoleteSvr.Count > 0)
            {
                context.ServiceVariantRequirements.RemoveRange(obsoleteSvr);
            }

            var obsoleteSve = await context.ServiceVariantElements
                .Where(e => obsoleteVariantIds.Contains(e.ServiceVariantId))
                .ToListAsync();
            if (obsoleteSve.Count > 0)
            {
                context.ServiceVariantElements.RemoveRange(obsoleteSve);
            }

            var obsoleteSn = await context.ServiceNotes
                .Where(n => n.ServiceVariantId.HasValue && obsoleteVariantIds.Contains(n.ServiceVariantId.Value))
                .ToListAsync();
            if (obsoleteSn.Count > 0)
            {
                context.ServiceNotes.RemoveRange(obsoleteSn);
            }

            var variantsToRemove = existingVariants.Where(ev => obsoleteVariantIds.Contains(ev.Id)).ToList();
            context.ServiceVariants.RemoveRange(variantsToRemove);
            await context.SaveChangesAsync();
            anyChange = true;
        }

        var existingServiceIds = (await context.Services.Select(s => s.Id).ToListAsync()).ToHashSet();

        // Upsert seeder variants
        foreach (var def in variantDefs)
        {
            if (!existingServiceIds.Contains(def.ServiceId))
            {
                continue;
            }

            var ev = existingVariants.FirstOrDefault(v => v.Id == def.Id);
            if (ev == null)
            {
                context.ServiceVariants.Add(new ServiceVariant
                {
                    Id = def.Id,
                    ServiceId = def.ServiceId,
                    Type = def.Type,
                    Description = def.Description
                });
                anyChange = true;
            }
            else
            {
                if (ev.ServiceId != def.ServiceId || ev.Type != def.Type || ev.Description != def.Description)
                {
                    ev.ServiceId = def.ServiceId;
                    ev.Type = def.Type;
                    ev.Description = def.Description;
                    anyChange = true;
                }
            }
        }

        if (anyChange)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task BackfillNewServicesAsync(ApplicationDbContext context)
    {
        var tenant = await context.Tenants.FirstOrDefaultAsync();
        if (tenant == null) return;

        var existingCategories = await context.ServiceCategories.ToListAsync();
        var categoryIds = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

        void AddCategoryMapping(string key, ServiceCategoryType type)
        {
            var cat = existingCategories.FirstOrDefault(c => c.Type == type);
            if (cat != null)
            {
                categoryIds[key] = cat.Id;
            }
        }

        AddCategoryMapping("Exams", ServiceCategoryType.Exam);
        AddCategoryMapping("Certificates", ServiceCategoryType.Certificate);
        AddCategoryMapping("Licenses", ServiceCategoryType.License);
        AddCategoryMapping("Permits", ServiceCategoryType.Permit);
        AddCategoryMapping("Accreditations", ServiceCategoryType.Accreditation);
        AddCategoryMapping("RequestsAndComplaints", ServiceCategoryType.RequestsAndComplaints);

        // Ensure fallback keys exist
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
        var existingServices = await context.Services.ToListAsync();
        bool anyChange = false;

        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Code == def.Code);
            if (s != null && s.Id != def.Id)
            {
                context.Services.Remove(s);
                await context.SaveChangesAsync();
                s = null;
                anyChange = true;
            }

            if (s == null)
            {
                s = new Service
                {
                    Id = def.Id,
                    ServiceCategoryId = def.CategoryId,
                    TenantId = tenant.Id,
                    Name = def.Name,
                    Group = def.Group,
                    Code = def.Code,
                    Description = def.Desc,
                    Contract = def.Contract
                };
                context.Services.Add(s);
                anyChange = true;
            }
            else
            {
                if (s.Name != def.Name || s.Group != def.Group || s.ServiceCategoryId != def.CategoryId || s.Contract != def.Contract)
                {
                    s.Name = def.Name;
                    s.Group = def.Group;
                    s.ServiceCategoryId = def.CategoryId;
                    s.Contract = def.Contract;
                    anyChange = true;
                }
            }
        }

        // Clean up any obsolete services not present in serviceDefs
        var validServiceIds = serviceDefs.Select(d => d.Id).ToHashSet();
        var obsoleteServices = existingServices.Where(s => !validServiceIds.Contains(s.Id)).ToList();
        if (obsoleteServices.Count > 0)
        {
            var obsoleteServiceIds = obsoleteServices.Select(s => s.Id).ToList();

            // 1. Re-assign any applicants pointing to obsolete services
            var fallbackServiceId = serviceDefs[0].Id;
            var referencingApplicants = await context.Applicants
                .Where(a => a.ServiceId != null && obsoleteServiceIds.Contains(a.ServiceId.Value))
                .ToListAsync();
            foreach (var applicant in referencingApplicants)
            {
                applicant.ServiceId = fallbackServiceId;
                applicant.ServiceVariantId = null;
            }

            // 2. Cascade delete obsolete forms, form sections, and section fields
            var obsoleteForms = await context.Forms
                .Where(f => obsoleteServiceIds.Contains(f.ServiceId))
                .ToListAsync();
            if (obsoleteForms.Count > 0)
            {
                var obsoleteFormIds = obsoleteForms.Select(f => f.Id).ToList();
                var obsoleteSections = await context.FormSections
                    .Where(s => obsoleteFormIds.Contains(s.FormId))
                    .ToListAsync();
                if (obsoleteSections.Count > 0)
                {
                    var obsoleteSectionIds = obsoleteSections.Select(s => s.Id).ToList();
                    var obsoleteFields = await context.SectionFields
                        .Where(sf => obsoleteSectionIds.Contains(sf.FormSectionId))
                        .ToListAsync();
                    if (obsoleteFields.Count > 0) context.SectionFields.RemoveRange(obsoleteFields);
                    context.FormSections.RemoveRange(obsoleteSections);
                }
                context.Forms.RemoveRange(obsoleteForms);
            }

            // 3. Cascade delete obsolete variants and children
            var obsoleteVariants = await context.ServiceVariants
                .Where(v => obsoleteServiceIds.Contains(v.ServiceId))
                .ToListAsync();
            if (obsoleteVariants.Count > 0)
            {
                var obsoleteVariantIds = obsoleteVariants.Select(v => v.Id).ToList();
                var obsoleteReqs = await context.ServiceVariantRequirements
                    .Where(vr => obsoleteVariantIds.Contains(vr.ServiceVariantId))
                    .ToListAsync();
                if (obsoleteReqs.Count > 0) context.ServiceVariantRequirements.RemoveRange(obsoleteReqs);

                var obsoleteElements = await context.ServiceVariantElements
                    .Where(ve => obsoleteVariantIds.Contains(ve.ServiceVariantId))
                    .ToListAsync();
                if (obsoleteElements.Count > 0) context.ServiceVariantElements.RemoveRange(obsoleteElements);

                context.ServiceVariants.RemoveRange(obsoleteVariants);
            }

            // 4. Delete obsolete service notes and fees
            var obsoleteNotes = await context.ServiceNotes
                .Where(sn => obsoleteServiceIds.Contains(sn.ServiceId))
                .ToListAsync();
            if (obsoleteNotes.Count > 0) context.ServiceNotes.RemoveRange(obsoleteNotes);

            var obsoleteFees = await context.ServiceFees
                .Where(sf => obsoleteServiceIds.Contains(sf.ServiceId))
                .ToListAsync();
            if (obsoleteFees.Count > 0) context.ServiceFees.RemoveRange(obsoleteFees);

            // 5. Remove obsolete services
            context.Services.RemoveRange(obsoleteServices);
            anyChange = true;
        }

        if (anyChange)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task BackfillNewCatalogDetailsAsync(ApplicationDbContext context)
    {
        var svc101 = Guid.Parse("50000000-0000-0000-0000-000000000001");

        var allVariantsInDb = await context.ServiceVariants.AsNoTracking().ToListAsync();
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
                if (matchingDbVariant != null)
                {
                    return matchingDbVariant.Id;
                }
            }
            return hardcodedVariantId;
        }

        // 2. Seed ServiceVariantElements
        var elementsToSeed = FastTrackSeederData.GetBackfillElements();
        var existingSve = (await context.ServiceVariantElements.AsNoTracking().Select(e => new { e.ServiceVariantId, e.Code }).ToListAsync())
            .Select(e => (e.ServiceVariantId, e.Code)).ToHashSet();

        foreach (var el in elementsToSeed)
        {
            Guid actualVariantId = ResolveVariantId(el.VariantId);
            if (validVariantIds.Contains(actualVariantId) && !existingSve.Contains((actualVariantId, el.Code)))
            {
                context.ServiceVariantElements.Add(new ServiceVariantElement
                {
                    Id = Guid.NewGuid(),
                    ServiceVariantId = actualVariantId,
                    Code = el.Code,
                    Description = el.Description
                });
                existingSve.Add((actualVariantId, el.Code));
            }
        }
        await context.SaveChangesAsync();

        // 2b. Also seed the master Elements table so that billing/fee mappings can reference them
        var uniqueElementCodes = elementsToSeed
            .GroupBy(e => e.Code)
            .Select(g => g.First())
            .ToList();

        var existingElements = (await context.Elements.AsNoTracking().Select(e => e.Code.ToLower()).ToListAsync()).ToHashSet();

        foreach (var el in uniqueElementCodes)
        {
            if (!existingElements.Contains(el.Code.ToLower()))
            {
                context.Elements.Add(new Element
                {
                    Id = Guid.NewGuid(),
                    Code = el.Code.ToUpper(),
                    Name = el.Code,
                    Description = el.Description
                });
            }
        }
        await context.SaveChangesAsync();

        // 3. Seed ServiceNotes
        var notesToSeed = FastTrackSeederData.GetBackfillNotes(svc101);
        var existingNotes = (await context.ServiceNotes.AsNoTracking().Select(n => new { n.ServiceId, n.ServiceVariantId, n.Notes }).ToListAsync())
            .Select(n => (n.ServiceId, n.ServiceVariantId, n.Notes)).ToHashSet();

        foreach (var note in notesToSeed)
        {
            Guid? actualVariantId = note.ServiceVariantId.HasValue ? ResolveVariantId(note.ServiceVariantId.Value) : null;
            if (actualVariantId.HasValue && !validVariantIds.Contains(actualVariantId.Value))
            {
                actualVariantId = null;
            }

            if (!existingNotes.Contains((note.ServiceId, actualVariantId, note.Content)))
            {
                context.ServiceNotes.Add(new ServiceNote
                {
                    Id = Guid.NewGuid(),
                    ServiceId = note.ServiceId,
                    ServiceVariantId = actualVariantId,
                    Notes = note.Content
                });
            }
        }
        await context.SaveChangesAsync();

        // 4. Seed Requirements
        var reqs = FastTrackSeederData.GetBackfillRequirements();
        var existingReqIds = (await context.Requirements.AsNoTracking().Select(r => r.Id).ToListAsync()).ToHashSet();

        foreach (var req in reqs.Values)
        {
            if (!existingReqIds.Contains(req.Id))
            {
                context.Requirements.Add(new Requirement
                {
                    Id = req.Id,
                    Name = req.Name,
                    Description = req.Desc
                });
                existingReqIds.Add(req.Id);
            }
        }
        await context.SaveChangesAsync();

        // 5. Seed ServiceVariantRequirements
        var tenantId = await context.Tenants.Select(t => (Guid?)t.Id).FirstOrDefaultAsync();
        var variantReqsToSeed = FastTrackSeederData.GetBackfillVariantRequirements();
        var existingSvr = (await context.ServiceVariantRequirements.AsNoTracking().Select(r => new { r.ServiceVariantId, r.RequirementId }).ToListAsync())
            .Select(r => (r.ServiceVariantId, r.RequirementId)).ToHashSet();

        foreach (var vr in variantReqsToSeed)
        {
            Guid actualVariantId = ResolveVariantId(vr.VariantId);
            if (!validVariantIds.Contains(actualVariantId) || !existingReqIds.Contains(vr.ReqId))
            {
                continue;
            }

            if (!existingSvr.Contains((actualVariantId, vr.ReqId)))
            {
                context.ServiceVariantRequirements.Add(new ServiceVariantRequirement
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ServiceVariantId = actualVariantId,
                    RequirementId = vr.ReqId,
                    IsRequired = vr.IsRequired
                });
                existingSvr.Add((actualVariantId, vr.ReqId));
            }
        }
        await context.SaveChangesAsync();

         // Deduplicate any existing duplicate database records
         var allSvr = await context.ServiceVariantRequirements.ToListAsync();
         var duplicatesToRemove = allSvr
             .GroupBy(r => new { r.ServiceVariantId, r.RequirementId })
             .SelectMany(g => g.Skip(1))
             .ToList();

         if (duplicatesToRemove.Any())
         {
             context.ServiceVariantRequirements.RemoveRange(duplicatesToRemove);
             await context.SaveChangesAsync();
         }

        // 6. Seed ServiceFees
        var examFeeId = Guid.Parse("f0000000-0000-0000-0000-000000000005"); // Operator Competency Exam Fee

        if (!await context.ServiceFees.AnyAsync(sf => sf.ServiceId == svc101 && sf.FeeId == examFeeId))
        {
            context.ServiceFees.Add(new ServiceFee
            {
                Id = Guid.NewGuid(),
                ServiceId = svc101,
                FeeId = examFeeId,
                Amount = 50.00m,
                IsActive = true
            });
        }
        await context.SaveChangesAsync();
        await ServiceInformationDataSeeder.SeedAsync(context);
    }
}
