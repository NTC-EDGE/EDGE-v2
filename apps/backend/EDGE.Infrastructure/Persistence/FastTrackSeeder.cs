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
                CREATE SCHEMA IF NOT EXISTS public;
                SET search_path TO public;

                DO $$ BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'ServiceVariants'
                    ) THEN
                        ALTER TABLE public.""ServiceVariants"" 
                        ADD COLUMN IF NOT EXISTS ""IsIndividual"" boolean NOT NULL DEFAULT true;
                    END IF;

                    IF EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = 'Requirements'
                    ) THEN
                        ALTER TABLE public.""Requirements"" 
                        ALTER COLUMN ""Description"" TYPE text;
                    END IF;
                END $$;
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

        // 2. Delegate to sub-seeders (FastTrackCatalogSeeder delegates fee seeding to FastTrackFeeSeeder)
        await FastTrackCatalogSeeder.BackfillNewServicesAsync(context);
        await FastTrackVariantSeeder.UpdateVariantsAsync(context);
        await FastTrackCatalogSeeder.BackfillNewCatalogDetailsAsync(context, logger);
        await context.SaveChangesAsync();

        await FastTrackFormSeeder.SeedFormsInternalAsync(context, logger);
    }
}
