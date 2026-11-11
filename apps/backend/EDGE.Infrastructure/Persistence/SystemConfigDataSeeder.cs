using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

public static class SystemConfigDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var existingConfigs = await context.SystemConfigs.ToListAsync();

        var defaultConfigs = new List<SystemConfig>
        {
            new()
            {
                Category = "Renewal",
                Key = "Renewal:DaysBeforeExpiration",
                Value = "60,30,15,1,0",
                Description = "Comma-separated days before expiration to notify clients for renewal and enable renewal button (e.g. 60,30,15,1,0 where 0 is on the day of expiration).",
                DataType = "String",
                IsPublic = true
            },
            new()
            {
                Category = "Renewal",
                Key = "Renewal:DefaultValidityYears",
                Value = "1",
                Description = "Default statutory validity duration in years added to original expiration date upon renewal.",
                DataType = "Number",
                IsPublic = true
            }
        };

        foreach (var def in defaultConfigs)
        {
            if (!existingConfigs.Any(c => c.Key == def.Key))
            {
                await context.SystemConfigs.AddAsync(def);
            }
        }

        await context.SaveChangesAsync();
    }
}
