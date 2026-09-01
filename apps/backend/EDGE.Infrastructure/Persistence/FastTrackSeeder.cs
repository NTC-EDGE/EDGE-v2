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
/// Main entrypoint and coordinator for fast-track catalog, variants, contracts, and form seeding.
/// </summary>
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

        bool skipInitialSeed = await context.Services.IgnoreQueryFilters().CountAsync() >= 12;
        if (skipInitialSeed)
        {
            await FastTrackContractSeeder.UpdateContractsAsync(context);
            await FastTrackCatalogSeeder.BackfillNewServicesAsync(context);
            await FastTrackVariantSeeder.UpdateVariantsAsync(context);
            await FastTrackCatalogSeeder.BackfillNewCatalogDetailsAsync(context, logger);
            await ServiceInformationDataSeeder.SeedAsync(context);
            await FastTrackFormSeeder.SeedFormsInternalAsync(context, logger);
            return;
        }

        var tenant = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Tenant not seeded. Run RolePermissionDataSeeder first.");

        // 1. Seed Service Categories
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

        // 2. Seed Master Fee Entities
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

        // 3. Delegate to sub-seeders
        await FastTrackCatalogSeeder.BackfillNewServicesAsync(context);
        await FastTrackVariantSeeder.UpdateVariantsAsync(context);
        await FastTrackCatalogSeeder.BackfillNewCatalogDetailsAsync(context, logger);
        await context.SaveChangesAsync();

        await FastTrackFormSeeder.SeedFormsInternalAsync(context, logger);
    }
}
