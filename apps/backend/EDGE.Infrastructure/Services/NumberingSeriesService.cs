using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Services;

public class NumberingSeriesService : INumberingSeriesService
{
    private readonly ApplicationDbContext _context;
    private readonly IRegionalConfigurationService _regionalConfigService;

    public NumberingSeriesService(
        ApplicationDbContext context,
        IRegionalConfigurationService regionalConfigService)
    {
        _context = context;
        _regionalConfigService = regionalConfigService;
    }

    public async Task<string> GenerateSoaNumberAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var config = await _regionalConfigService.GetConfigurationAsync(tenantId, cancellationToken);
        var rcCode = CleanRcCode(config.RcCodeSoa, config.TenantCode, "61");
        var year = DateTime.UtcNow.ToString("yyyy");
        var month = DateTime.UtcNow.ToString("MM");
        var prefix = $"{rcCode}-{year}-{month}-";

        var existingNumbers = await _context.StatementsOfAccount
            .Where(s => s.SoaNumber.StartsWith(prefix))
            .Select(s => s.SoaNumber)
            .ToListAsync(cancellationToken);

        var nextSeries = CalculateNextSeries(prefix, existingNumbers);
        return $"{prefix}{nextSeries:D4}";
    }

    public async Task<string> GenerateOpNumberAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var config = await _regionalConfigService.GetConfigurationAsync(tenantId, cancellationToken);
        var rcCode = CleanRcCode(config.RcCodeOp, config.TenantCode, "61");
        var year = DateTime.UtcNow.ToString("yyyy");
        var month = DateTime.UtcNow.ToString("MM");
        var prefix = $"{rcCode}-{year}-{month}-";

        var existingNumbers = await _context.OrdersOfPayment
            .Where(o => o.OpNumber.StartsWith(prefix))
            .Select(o => o.OpNumber)
            .ToListAsync(cancellationToken);

        var nextSeries = CalculateNextSeries(prefix, existingNumbers);
        return $"{prefix}{nextSeries:D4}";
    }

    private static string CleanRcCode(string? configuredCode, string? tenantCode, string fallback)
    {
        var candidate = !string.IsNullOrWhiteSpace(configuredCode) ? configuredCode.Trim() : tenantCode;
        if (string.IsNullOrWhiteSpace(candidate)) return fallback;

        // Strip "RC-" or "Region " prefixes
        candidate = candidate.Replace("RC-", "", StringComparison.OrdinalIgnoreCase)
                             .Replace("Region", "", StringComparison.OrdinalIgnoreCase)
                             .Trim();

        return !string.IsNullOrWhiteSpace(candidate) ? candidate : fallback;
    }

    private static int CalculateNextSeries(string prefix, System.Collections.Generic.List<string> existingNumbers)
    {
        if (existingNumbers == null || existingNumbers.Count == 0) return 1;

        var maxNumber = 0;
        foreach (var num in existingNumbers)
        {
            if (num.Length > prefix.Length)
            {
                var suffix = num.Substring(prefix.Length);
                if (int.TryParse(suffix, out var parsed) && parsed > maxNumber)
                {
                    maxNumber = parsed;
                }
            }
        }

        return maxNumber + 1;
    }
}
