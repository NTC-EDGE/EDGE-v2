using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Infrastructure.Persistence;

/// <summary>
/// Handles synchronization and updates of Service Contract JSON definitions.
/// </summary>
public static class FastTrackContractSeeder
{
    public static async Task UpdateContractsAsync(ApplicationDbContext context)
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

            var normalizedNew = newContract.Trim();
            var normalizedCurrent = (service.Contract ?? string.Empty).Trim();
            if (normalizedCurrent == normalizedNew)
                continue;

            service.Contract = newContract;
            anyChange = true;
        }

        if (anyChange)
            await context.SaveChangesAsync();
    }
}
