using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using static EDGE.Infrastructure.Persistence.ServiceInformationDataSeeder;

namespace EDGE.Infrastructure.Persistence;

public static class FastTrackSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""ServiceVariants"" 
                ADD COLUMN IF NOT EXISTS ""IsIndividual"" boolean NOT NULL DEFAULT true;

                ALTER TABLE ""Requirements"" 
                ALTER COLUMN ""Description"" TYPE text;
            ");
        }
        catch
        {
            // Table may not exist yet in fresh setup
        }

        // Skip the full initial seed if services are already present.
        // However, always run the contract-update pass below so that changes to
        // requirementDiscriminatorFields / requirementContextGroups in the contract
        // JSON strings are applied to existing rows without needing a full re-seed.
        bool skipInitialSeed = await context.Services.IgnoreQueryFilters().CountAsync() >= 12;
        if (skipInitialSeed)
        {
            await UpdateContractsAsync(context);
            await BackfillNewServicesAsync(context);      // 1. Seed new Services first (so variants FK matches)
            await UpdateVariantsAsync(context);          // 2. Update/upsert all variants
            await BackfillNewCatalogDetailsAsync(context, logger); // 3. Backfill elements, notes, requirements, and fees
            await ServiceInformationDataSeeder.SeedAsync(context);  // 4. Seed ServiceInformations entity records
            await SeedFormsInternalAsync(context, logger); // 5. Seed Form layouts
            return;
        }

        var tenant = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Tenant not seeded. Run RolePermissionDataSeeder first.");

        // 1. Seed Service Categories (matching spec)
        var categories = new Dictionary<string, ServiceCategory>();
        var existingCategories = await context.ServiceCategories.IgnoreQueryFilters().ToListAsync();

        ServiceCategory GetOrAddCategory(string key, string name, string code, ServiceCategoryType type, Guid defaultId)
        {
            var existing = existingCategories.FirstOrDefault(c => c.Code == code || c.Type == type);
            if (existing != null)
            {
                if (existing.IsDeleted)
                {
                    existing.IsDeleted = false;
                    existing.IsDeletedBy = string.Empty;
                }
                return existing;
            }

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
        if (!await context.Fees.IgnoreQueryFilters().AnyAsync())
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
        var existingServices = await context.Services.IgnoreQueryFilters().ToListAsync();

        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Id == def.Id)
                 ?? existingServices.FirstOrDefault(x => x.Code == def.Code);

            if (s != null && s.Id != def.Id)
            {
                context.Services.Remove(s);
                await context.SaveChangesAsync();
                existingServices.Remove(s);
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
                existingServices.Add(s);
            }
            else
            {
                s.IsDeleted = false;
                s.IsDeletedBy = string.Empty;
                s.Code = def.Code;
                s.Name = def.Name;
                s.Group = def.Group;
                s.Description = def.Desc;
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
        await BackfillNewCatalogDetailsAsync(context, logger);

        await context.SaveChangesAsync();

        await SeedFormsInternalAsync(context, logger);
    }

    private static async Task SeedFormsInternalAsync(ApplicationDbContext context, ILogger? logger = null)
    {
        // 7. Seed Central Reusable Fields Pool (Deterministic GUIDs)
        var fieldsPool = FastTrackSeederData.GetFieldsPool();

        var existingFields = await context.Fields.IgnoreQueryFilters().ToListAsync();
        foreach (var f in fieldsPool.Values)
        {
            var existing = existingFields.FirstOrDefault(x => x.Id == f.Id);
            if (existing == null)
            {
                context.Fields.Add(f);
            }
            else if (existing.Label != f.Label || existing.FieldType != f.FieldType || existing.SyncBackOnSubmit != f.SyncBackOnSubmit || existing.IsDeleted)
            {
                existing.IsDeleted = false;
                existing.IsDeletedBy = string.Empty;
                existing.Label = f.Label;
                existing.FieldType = f.FieldType;
                existing.SyncBackOnSubmit = f.SyncBackOnSubmit;
            }
        }
        await context.SaveChangesAsync();

        // 7b. Self-heal any existing duplicate FormSections (FormId + Key) globally before seeding
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

        // 8. Seed Form Builders & Sections per Service
        var services = new Dictionary<string, Service>();

        async Task SeedFormForService(string serviceKey, Guid formId, Guid sectionGuidPrefix, List<(string Key, string Title, List<string> FieldKeys)> sectionDefs)
        {
            if (!services.TryGetValue(serviceKey, out var service))
            {
                service = await context.Services.IgnoreQueryFilters().FirstOrDefaultAsync(s => s.Code == serviceKey);
                if (service == null) return;
                services[serviceKey] = service;
            }

            // 1. Ensure exactly one Form exists for this service / formId
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
                    logger?.LogInformation("Self-healing: Removed {Count} redundant form(s) for service {ServiceKey}.", redundantForms.Count, serviceKey);
                }
            }

            // 2. Fetch all existing FormSections for targetForm
            var existingSections = await context.FormSections
                .IgnoreQueryFilters()
                .Where(s => s.FormId == targetForm.Id)
                .ToListAsync();

            // Self-heal: Deduplicate any existing duplicate sections by Key (case-insensitive)
            var duplicateSecGroups = existingSections
                .GroupBy(s => (s.Key ?? string.Empty).Trim(), StringComparer.OrdinalIgnoreCase)
                .Where(g => g.Count() > 1)
                .ToList();

            foreach (var group in duplicateSecGroups)
            {
                var keep = group.FirstOrDefault(s => !s.IsDeleted) ?? group.First();
                var toRemove = group.Where(s => s.Id != keep.Id).ToList();
                var toRemoveIds = toRemove.Select(s => s.Id).ToList();
                var toRemoveFields = await context.SectionFields
                    .Where(sf => toRemoveIds.Contains(sf.FormSectionId))
                    .ToListAsync();
                if (toRemoveFields.Count > 0) context.SectionFields.RemoveRange(toRemoveFields);
                context.FormSections.RemoveRange(toRemove);
                await context.SaveChangesAsync();
                foreach (var rem in toRemove) existingSections.Remove(rem);
            }
            if (duplicateSecGroups.Count > 0)
            {
                logger?.LogInformation("Self-healing: Deduplicated {Count} section key group(s) in form {FormId} for service {ServiceKey}.", duplicateSecGroups.Count, targetForm.Id, serviceKey);
            }

            var deduplicatedSections = sectionDefs
                .GroupBy(s => (s.Key ?? string.Empty).Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First())
                .ToList();

            var desiredKeys = deduplicatedSections.Select(s => s.Key.Trim()).ToHashSet(StringComparer.OrdinalIgnoreCase);

            // Remove sections no longer in definition (both active and soft-deleted to avoid key conflict)
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
                logger?.LogInformation("Self-healing: Removed {Count} obsolete section(s) in form {FormId} for service {ServiceKey}.", obsoleteSections.Count, targetForm.Id, serviceKey);
            }

            // 3. Upsert sections and fields
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

                // Refresh section fields
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
                            IsRequired = fk != "exactLocation" && fk != "longitude" && fk != "latitude" && fk != "bsdNo" && key != "antennaSystem" && key != "signalReception" && key != "bsd" && key != "assistanceRequest" && key != "applicantEducation" && key != "knownByAnotherName" && key != "club" && key != "examination" && key != "radioOfficers" && key != "payment",
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
            .IgnoreQueryFilters()
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
        var existingVariants = await context.ServiceVariants.IgnoreQueryFilters().ToListAsync();
        var variantDefs = FastTrackSeederData.GetVariantDefs();
        var variantDefIds = variantDefs.Select(d => d.Id).ToHashSet();
        
        bool anyChange = false;

        // Clean up and remove variants no longer defined in seeder
        var obsoleteVariantIds = existingVariants
            .Where(ev => !variantDefIds.Contains(ev.Id) && !ev.IsDeleted)
            .Select(ev => ev.Id)
            .ToList();

        if (obsoleteVariantIds.Count > 0)
        {
            var referencingApplicants = await context.Applicants
                .IgnoreQueryFilters()
                .Where(a => a.ServiceVariantId.HasValue && obsoleteVariantIds.Contains(a.ServiceVariantId.Value))
                .ToListAsync();
            foreach (var app in referencingApplicants)
            {
                app.ServiceVariantId = null;
            }

            var obsoleteSvr = await context.ServiceVariantRequirements
                .IgnoreQueryFilters()
                .Where(r => obsoleteVariantIds.Contains(r.ServiceVariantId))
                .ToListAsync();
            if (obsoleteSvr.Count > 0)
            {
                context.ServiceVariantRequirements.RemoveRange(obsoleteSvr);
            }

            var obsoleteSve = await context.ServiceVariantElements
                .IgnoreQueryFilters()
                .Where(e => obsoleteVariantIds.Contains(e.ServiceVariantId))
                .ToListAsync();
            if (obsoleteSve.Count > 0)
            {
                context.ServiceVariantElements.RemoveRange(obsoleteSve);
            }

            var obsoleteSn = await context.ServiceNotes
                .IgnoreQueryFilters()
                .Where(n => n.ServiceVariantId.HasValue && obsoleteVariantIds.Contains(n.ServiceVariantId.Value))
                .ToListAsync();
            if (obsoleteSn.Count > 0)
            {
                context.ServiceNotes.RemoveRange(obsoleteSn);
            }

            var obsoleteFees = await context.ServiceFees
                .IgnoreQueryFilters()
                .Where(sf => sf.ServiceVariantId.HasValue && obsoleteVariantIds.Contains(sf.ServiceVariantId.Value))
                .ToListAsync();
            if (obsoleteFees.Count > 0)
            {
                context.ServiceFees.RemoveRange(obsoleteFees);
            }

            var obsoleteVf = await context.ServiceVariantFees
                .IgnoreQueryFilters()
                .Where(vf => obsoleteVariantIds.Contains(vf.ServiceVariantId))
                .ToListAsync();
            if (obsoleteVf.Count > 0)
            {
                context.ServiceVariantFees.RemoveRange(obsoleteVf);
            }

            var obsoleteVef = await context.ServiceVariantElementFees
                .IgnoreQueryFilters()
                .Where(vef => obsoleteVariantIds.Contains(vef.ServiceVariantId))
                .ToListAsync();
            if (obsoleteVef.Count > 0)
            {
                context.ServiceVariantElementFees.RemoveRange(obsoleteVef);
            }

            var variantsToRemove = existingVariants.Where(ev => obsoleteVariantIds.Contains(ev.Id) && !ev.IsDeleted).ToList();
            context.ServiceVariants.RemoveRange(variantsToRemove);
            await context.SaveChangesAsync();
            anyChange = true;
        }

        var existingServiceIds = (await context.Services.IgnoreQueryFilters().Select(s => s.Id).ToListAsync()).ToHashSet();

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
                    Description = def.Description,
                    IsIndividual = def.IsIndividual
                });
                anyChange = true;
            }
            else
            {
                if (ev.IsDeleted || ev.ServiceId != def.ServiceId || ev.Type != def.Type || ev.Description != def.Description || ev.IsIndividual != def.IsIndividual)
                {
                    ev.IsDeleted = false;
                    ev.IsDeletedBy = string.Empty;
                    ev.ServiceId = def.ServiceId;
                    ev.Type = def.Type;
                    ev.Description = def.Description;
                    ev.IsIndividual = def.IsIndividual;
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
        var tenant = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync();
        if (tenant == null) return;

        var existingCategories = await context.ServiceCategories.IgnoreQueryFilters().ToListAsync();
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
        var existingServices = await context.Services.IgnoreQueryFilters().ToListAsync();
        bool anyChange = false;

        foreach (var def in serviceDefs)
        {
            var s = existingServices.FirstOrDefault(x => x.Id == def.Id)
                 ?? existingServices.FirstOrDefault(x => x.Code == def.Code);

            if (s != null && s.Id != def.Id)
            {
                context.Services.Remove(s);
                await context.SaveChangesAsync();
                existingServices.Remove(s);
                s = null;
                anyChange = true;
            }

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

        // Clean up any obsolete services not present in serviceDefs
        var validServiceIds = serviceDefs.Select(d => d.Id).ToHashSet();
        var obsoleteServices = existingServices.Where(s => !validServiceIds.Contains(s.Id) && !s.IsDeleted).ToList();
        if (obsoleteServices.Count > 0)
        {
            var obsoleteServiceIds = obsoleteServices.Select(s => s.Id).ToList();

            // 1. Re-assign any applicants pointing to obsolete services
            var fallbackServiceId = serviceDefs[0].Id;
            var referencingApplicants = await context.Applicants
                .IgnoreQueryFilters()
                .Where(a => a.ServiceId != null && obsoleteServiceIds.Contains(a.ServiceId.Value))
                .ToListAsync();
            foreach (var applicant in referencingApplicants)
            {
                applicant.ServiceId = fallbackServiceId;
                applicant.ServiceVariantId = null;
            }

            // 2. Cascade delete obsolete forms, form sections, and section fields
            var obsoleteForms = await context.Forms
                .IgnoreQueryFilters()
                .Where(f => obsoleteServiceIds.Contains(f.ServiceId))
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
                .IgnoreQueryFilters()
                .Where(v => obsoleteServiceIds.Contains(v.ServiceId))
                .ToListAsync();
            if (obsoleteVariants.Count > 0)
            {
                var obsoleteVariantIds = obsoleteVariants.Select(v => v.Id).ToList();
                var obsoleteReqs = await context.ServiceVariantRequirements
                    .IgnoreQueryFilters()
                    .Where(vr => obsoleteVariantIds.Contains(vr.ServiceVariantId))
                    .ToListAsync();
                if (obsoleteReqs.Count > 0) context.ServiceVariantRequirements.RemoveRange(obsoleteReqs);

                var obsoleteElements = await context.ServiceVariantElements
                    .IgnoreQueryFilters()
                    .Where(ve => obsoleteVariantIds.Contains(ve.ServiceVariantId))
                    .ToListAsync();
                if (obsoleteElements.Count > 0) context.ServiceVariantElements.RemoveRange(obsoleteElements);

                context.ServiceVariants.RemoveRange(obsoleteVariants);
            }

            // 4. Delete obsolete service notes and fees
            var obsoleteNotes = await context.ServiceNotes
                .IgnoreQueryFilters()
                .Where(sn => obsoleteServiceIds.Contains(sn.ServiceId))
                .ToListAsync();
            if (obsoleteNotes.Count > 0) context.ServiceNotes.RemoveRange(obsoleteNotes);

            var obsoleteFees = await context.ServiceFees
                .IgnoreQueryFilters()
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

    private static async Task BackfillNewCatalogDetailsAsync(ApplicationDbContext context, ILogger? logger = null)
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
                if (matchingDbVariant != null)
                {
                    return matchingDbVariant.Id;
                }
            }
            return hardcodedVariantId;
        }

        // 2. Seed / Sync ServiceVariantElements
        var elementsToSeed = FastTrackSeederData.GetBackfillElements();
        var allDbSve = await context.ServiceVariantElements.IgnoreQueryFilters().ToListAsync();

        var desiredElements = new List<(Guid VariantId, string Code, string Description)>();
        foreach (var el in elementsToSeed)
        {
            Guid actualVariantId = ResolveVariantId(el.VariantId);
            if (validVariantIds.Contains(actualVariantId))
            {
                desiredElements.Add((actualVariantId, el.Code, el.Description));
            }
        }

        var desiredSet = desiredElements.ToHashSet();
        var seededVariantIds = desiredElements.Select(d => d.VariantId).ToHashSet();

        // Remove obsolete elements belonging to seeded variants that are no longer in definition
        var obsoleteElements = allDbSve
            .Where(e => seededVariantIds.Contains(e.ServiceVariantId) && !desiredSet.Contains((e.ServiceVariantId, e.Code, e.Description)) && !e.IsDeleted)
            .ToList();

        if (obsoleteElements.Count > 0)
        {
            context.ServiceVariantElements.RemoveRange(obsoleteElements);
            await context.SaveChangesAsync();
            allDbSve = await context.ServiceVariantElements.IgnoreQueryFilters().ToListAsync();
        }

        var existingDbSet = allDbSve.Select(e => (e.ServiceVariantId, e.Code, e.Description)).ToHashSet();

        foreach (var (variantId, code, desc) in desiredElements)
        {
            var existingEl = allDbSve.FirstOrDefault(e => e.ServiceVariantId == variantId && e.Code == code && e.Description == desc);
            if (existingEl == null)
            {
                context.ServiceVariantElements.Add(new ServiceVariantElement
                {
                    Id = Guid.NewGuid(),
                    ServiceVariantId = variantId,
                    Code = code,
                    Description = desc
                });
            }
            else if (existingEl.IsDeleted)
            {
                existingEl.IsDeleted = false;
                existingEl.IsDeletedBy = string.Empty;
            }
        }
        await context.SaveChangesAsync();

        // 2b. Also seed the master Elements table so that billing/fee mappings can reference them
        var uniqueElementCodes = elementsToSeed
            .GroupBy(e => e.Code)
            .Select(g => g.First())
            .ToList();

        var existingElements = (await context.Elements.IgnoreQueryFilters().AsNoTracking().Select(e => e.Code.ToLower()).ToListAsync()).ToHashSet();

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
        var existingNotesList = await context.ServiceNotes.IgnoreQueryFilters().ToListAsync();

        foreach (var note in notesToSeed)
        {
            Guid? actualVariantId = note.ServiceVariantId.HasValue ? ResolveVariantId(note.ServiceVariantId.Value) : null;
            if (actualVariantId.HasValue && !validVariantIds.Contains(actualVariantId.Value))
            {
                actualVariantId = null;
            }

            var matchingNote = existingNotesList.FirstOrDefault(n => n.ServiceId == note.ServiceId && n.ServiceVariantId == actualVariantId && n.Notes == note.Content);
            if (matchingNote == null)
            {
                context.ServiceNotes.Add(new ServiceNote
                {
                    Id = Guid.NewGuid(),
                    ServiceId = note.ServiceId,
                    ServiceVariantId = actualVariantId,
                    Notes = note.Content
                });
            }
            else if (matchingNote.IsDeleted)
            {
                matchingNote.IsDeleted = false;
                matchingNote.IsDeletedBy = string.Empty;
            }
        }
        await context.SaveChangesAsync();

        // 4. Seed Requirements
        var reqs = FastTrackSeederData.GetBackfillRequirements();
        var existingRequirements = await context.Requirements.IgnoreQueryFilters().ToListAsync();
        var existingReqMap = existingRequirements.ToDictionary(r => r.Id);

        foreach (var req in reqs.Values)
        {
            if (!existingReqMap.TryGetValue(req.Id, out var existing))
            {
                var newReq = new Requirement
                {
                    Id = req.Id,
                    Name = req.Name,
                    Description = req.Desc
                };
                context.Requirements.Add(newReq);
                existingReqMap[req.Id] = newReq;
            }
            else
            {
                existing.IsDeleted = false;
                existing.IsDeletedBy = string.Empty;
                existing.Name = req.Name;
                existing.Description = req.Desc;
            }
        }
        await context.SaveChangesAsync();
        var existingReqIds = existingReqMap.Keys.ToHashSet();

        // 5. Seed ServiceVariantRequirements
        var tenantId = await context.Tenants.IgnoreQueryFilters().Select(t => (Guid?)t.Id).FirstOrDefaultAsync();
        var variantReqsToSeed = FastTrackSeederData.GetBackfillVariantRequirements();
        var allExistingSvr = await context.ServiceVariantRequirements.IgnoreQueryFilters().ToListAsync();
        var baseTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        int seedIndex = 0;

        foreach (var vr in variantReqsToSeed)
        {
            seedIndex++;
            Guid actualVariantId = ResolveVariantId(vr.VariantId);
            if (!validVariantIds.Contains(actualVariantId) || !existingReqIds.Contains(vr.ReqId))
            {
                continue;
            }

            var existingRecord = allExistingSvr.FirstOrDefault(r => r.ServiceVariantId == actualVariantId && r.RequirementId == vr.ReqId);
            if (existingRecord == null)
            {
                var newSvr = new ServiceVariantRequirement
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ServiceVariantId = actualVariantId,
                    RequirementId = vr.ReqId,
                    IsRequired = vr.IsRequired,
                    CreatedAt = baseTime.AddSeconds(seedIndex)
                };
                context.ServiceVariantRequirements.Add(newSvr);
                allExistingSvr.Add(newSvr);
            }
            else
            {
                existingRecord.IsDeleted = false;
                existingRecord.IsDeletedBy = string.Empty;
                existingRecord.IsRequired = vr.IsRequired;
                existingRecord.CreatedAt = baseTime.AddSeconds(seedIndex);
            }
        }
        await context.SaveChangesAsync();

        // Deduplicate any existing duplicate database records
        var allSvr = await context.ServiceVariantRequirements.IgnoreQueryFilters().ToListAsync();
        var duplicatesToRemove = allSvr
            .GroupBy(r => new { r.ServiceVariantId, r.RequirementId })
            .SelectMany(g => g.Skip(1))
            .ToList();

        if (duplicatesToRemove.Any())
        {
            context.ServiceVariantRequirements.RemoveRange(duplicatesToRemove);
            await context.SaveChangesAsync();
            logger?.LogInformation("Self-healing: Removed {Count} duplicate ServiceVariantRequirement records.", duplicatesToRemove.Count);
        }

        // 6. Seed ServiceFees
        var examFeeId = Guid.Parse("f0000000-0000-0000-0000-000000000005"); // Operator Competency Exam Fee

        var existingServiceFee = await context.ServiceFees.IgnoreQueryFilters().FirstOrDefaultAsync(sf => sf.ServiceId == svc101 && sf.FeeId == examFeeId);
        if (existingServiceFee == null)
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
        else if (existingServiceFee.IsDeleted)
        {
            existingServiceFee.IsDeleted = false;
            existingServiceFee.IsDeletedBy = string.Empty;
            existingServiceFee.IsActive = true;
        }
        await context.SaveChangesAsync();

        // 7. Seed Examination Schedules for all Tenants
        var allTenants = await context.Tenants.IgnoreQueryFilters().ToListAsync();
        var nowUtc = DateTime.UtcNow;

        foreach (var tenantItem in allTenants)
        {
            var hasUpcoming = await context.Schedules.IgnoreQueryFilters().AnyAsync(s => s.ServiceId == svc101 && s.TenantId == tenantItem.Id && s.EndDate >= nowUtc && s.IsPublished && !s.IsDeleted);
            if (!hasUpcoming)
            {
                context.Schedules.AddRange(
                    new Schedule
                    {
                        Id = Guid.NewGuid(),
                        ServiceId = svc101,
                        TenantId = tenantItem.Id,
                        Venue = $"{tenantItem.Name} Regional Testing Center - Room 101",
                        StartDate = nowUtc.Date.AddDays(7).AddHours(8),
                        EndDate = nowUtc.Date.AddDays(7).AddHours(12),
                        StartApplication = nowUtc.Date.AddDays(-30),
                        EndApplication = nowUtc.Date.AddDays(6),
                        IsPublished = true,
                        MaximumSlots = 50,
                        Remarks = "Regular Morning Examination Session"
                    },
                    new Schedule
                    {
                        Id = Guid.NewGuid(),
                        ServiceId = svc101,
                        TenantId = tenantItem.Id,
                        Venue = $"{tenantItem.Name} Regional Testing Center - Room 102",
                        StartDate = nowUtc.Date.AddDays(21).AddHours(13),
                        EndDate = nowUtc.Date.AddDays(21).AddHours(17),
                        StartApplication = nowUtc.Date.AddDays(-30),
                        EndApplication = nowUtc.Date.AddDays(20),
                        IsPublished = true,
                        MaximumSlots = 40,
                        Remarks = "Special Afternoon Radio Operator Examination Session"
                    }
                );
            }
        }
        await context.SaveChangesAsync();

        await ServiceInformationDataSeeder.SeedAsync(context);
    }
}
