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
        if (!await context.Tenants.IgnoreQueryFilters().AnyAsync())
        {
            throw new InvalidOperationException("Tenant not seeded. Run RolePermissionDataSeeder first.");
        }

        // 1. Ensure Service Categories exist (Idempotent)
        var existingCategories = await context.ServiceCategories.IgnoreQueryFilters().ToListAsync();
        bool categoriesChanged = false;

        void EnsureCategory(string name, string code, ServiceCategoryType type, Guid defaultId)
        {
            var existing = existingCategories.FirstOrDefault(c => c.Code == code || c.Type == type);
            if (existing != null)
            {
                if (existing.IsDeleted)
                {
                    existing.IsDeleted = false;
                    existing.IsDeletedBy = string.Empty;
                    categoriesChanged = true;
                }
                return;
            }

            context.ServiceCategories.Add(new ServiceCategory { Id = defaultId, Name = name, Code = code, Type = type });
            categoriesChanged = true;
        }

        EnsureCategory("Exams", "EXAM", ServiceCategoryType.Exam, Guid.Parse("c0000000-0000-0000-0000-000000000001"));
        EnsureCategory("Certificates", "CERT", ServiceCategoryType.Certificate, Guid.Parse("c0000000-0000-0000-0000-000000000002"));
        EnsureCategory("Licenses", "LIC", ServiceCategoryType.License, Guid.Parse("c0000000-0000-0000-0000-000000000003"));
        EnsureCategory("Permits", "PRM", ServiceCategoryType.Permit, Guid.Parse("c0000000-0000-0000-0000-000000000004"));
        EnsureCategory("Accreditations", "ACCR", ServiceCategoryType.Accreditation, Guid.Parse("c0000000-0000-0000-0000-000000000005"));
        EnsureCategory("Requests and Complaints", "REQ", ServiceCategoryType.RequestsAndComplaints, Guid.Parse("c0000000-0000-0000-0000-000000000006"));

        if (categoriesChanged)
        {
            await context.SaveChangesAsync();
        }

        // 2. Seed and synchronize catalog services, contracts, variants, requirements, fees, service info, and forms
        await FastTrackCatalogSeeder.BackfillNewServicesAsync(context);
        await FastTrackContractSeeder.UpdateContractsAsync(context);
        await FastTrackVariantSeeder.UpdateVariantsAsync(context);
        await FastTrackCatalogSeeder.BackfillNewCatalogDetailsAsync(context, logger);
        await ServiceInformationDataSeeder.SeedAsync(context);
        try
        {
            await FastTrackFormSeeder.SeedFormsInternalAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger?.LogError(ex, "FastTrackFormSeeder encountered an error during self-healing/seeding. Clearing change tracker and continuing startup.");
            context.ChangeTracker.Clear();
        }
    }
}
