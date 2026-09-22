using System;
using System.Linq;

namespace EDGE.Application.Fees.Calculations;

/// <summary>
/// Defensive string evaluation extensions for safe pattern matching in calculation strategies.
/// </summary>
public static class StringCalculationExtensions
{
    public static bool SafeContains(this string? source, string target)
    {
        if (string.IsNullOrWhiteSpace(source) || string.IsNullOrWhiteSpace(target))
            return false;

        return source.Contains(target, StringComparison.OrdinalIgnoreCase);
    }

    public static bool SafeContainsAny(this string? source, params string[] targets)
    {
        if (string.IsNullOrWhiteSpace(source) || targets == null || targets.Length == 0)
            return false;

        return targets.Any(t => !string.IsNullOrWhiteSpace(t) && source.Contains(t, StringComparison.OrdinalIgnoreCase));
    }

    public static bool SafeEquals(this string? source, string target)
    {
        if (source == null && target == null) return true;
        if (source == null || target == null) return false;

        return string.Equals(source.Trim(), target.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    public static string SafeTrim(this string? source)
    {
        return string.IsNullOrWhiteSpace(source) ? string.Empty : source.Trim();
    }
}
