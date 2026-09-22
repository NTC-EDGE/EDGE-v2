using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

/// <summary>
/// Handles synchronization, creation, and cleanup of Service Variants and related child records.
/// </summary>
public static class FastTrackVariantSeeder
{
    public static async Task UpdateVariantsAsync(ApplicationDbContext context)
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
}
