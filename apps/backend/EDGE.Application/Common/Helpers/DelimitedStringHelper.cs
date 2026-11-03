using System;
using System.Collections.Generic;
using System.Linq;

namespace EDGE.Application.Common.Helpers;

/// <summary>
/// Centralized helper for parsing, cleaning, and formatting delimited string lists
/// such as comma or semicolon separated collections (e.g. Official Receipt numbers).
/// </summary>
public static class DelimitedStringHelper
{
    public static readonly char[] DefaultDelimiters = [',', ';'];

    /// <summary>
    /// Splits a delimited string by comma or semicolon, trimming each token and removing empty/whitespace entries.
    /// </summary>
    public static IEnumerable<string> SplitDelimited(string? input, char[]? delimiters = null)
    {
        if (string.IsNullOrWhiteSpace(input))
            return Enumerable.Empty<string>();

        return input.Split(delimiters ?? DefaultDelimiters, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => !string.IsNullOrWhiteSpace(s));
    }

    /// <summary>
    /// Splits multiple delimited strings or collections into distinct, trimmed, non-empty tokens.
    /// </summary>
    public static List<string> ParseDistinctTokens(
        IEnumerable<string?>? inputs,
        char[]? delimiters = null,
        IEqualityComparer<string>? comparer = null)
    {
        if (inputs == null)
            return [];

        return inputs
            .Where(i => !string.IsNullOrWhiteSpace(i))
            .SelectMany(i => SplitDelimited(i, delimiters))
            .Distinct(comparer ?? StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    /// <summary>
    /// Extracts and deduplicates OR numbers from multiple sources.
    /// </summary>
    public static List<string> ParseOrNumbers(params string?[] inputs)
    {
        return ParseDistinctTokens(inputs, DefaultDelimiters, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Formats a list of OR numbers into a clean comma-separated display string.
    /// Returns null if no valid numbers exist.
    /// </summary>
    public static string? FormatOrDisplay(IEnumerable<string?>? inputs)
    {
        var tokens = ParseDistinctTokens(inputs, DefaultDelimiters, StringComparer.OrdinalIgnoreCase);
        return tokens.Count > 0 ? string.Join(", ", tokens) : null;
    }
}
