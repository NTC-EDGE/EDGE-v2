using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace EDGE.Application.Fees.Calculations;

/// <summary>
/// Thread-safe arithmetic expression evaluator and multiplier calculator for dynamic administrative fee formulas.
/// </summary>
public static class DynamicFeeFormulaEvaluator
{
    /// <summary>
    /// Computes amount using boolean multiplier flags.
    /// </summary>
    public static decimal CalculateStandardMultiplier(
        decimal baseRate,
        bool multiYears,
        int years,
        bool multiUnits,
        int units,
        bool multiChannels,
        int channels,
        bool multiPages,
        int pages)
    {
        var y = multiYears ? Math.Max(1, years) : 1;
        var u = multiUnits ? Math.Max(1, units) : 1;
        var c = multiChannels ? Math.Max(1, channels) : 1;
        var p = multiPages ? Math.Max(1, pages) : 1;

        return baseRate * y * u * c * p;
    }

    /// <summary>
    /// Evaluates dynamic mathematical formulas with variable substitution.
    /// Supports standard NTC tariff notation (e.g. "{RATE} * {YEARS} * {UNITS}", "(ROC)(YR) + DST", etc.)
    /// </summary>
    public static decimal Evaluate(
        string? formula,
        decimal rate,
        int years = 1,
        int units = 1,
        int channels = 1,
        int pages = 1,
        int additionalServices = 0,
        decimal dst = 30.00m,
        decimal surcharge = 0m)
    {
        if (string.IsNullOrWhiteSpace(formula))
        {
            return rate * Math.Max(1, years) * Math.Max(1, units);
        }

        try
        {
            var rawExpr = formula.Trim();
            if (rawExpr.Contains('='))
            {
                var parts = rawExpr.Split('=', 2);
                rawExpr = parts[1].Trim();
            }

            var safeYears = Math.Max(1, years);
            var safeUnits = Math.Max(1, units);
            var safeChannels = Math.Max(1, channels);
            var safePages = Math.Max(1, pages);
            var safeNas = Math.Max(0, additionalServices);

            // Replace bracketed placeholders
            var expr = rawExpr
                .Replace("{RATE}", rate.ToString("F2", CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{YEARS}", safeYears.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{YR}", safeYears.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{UNITS}", safeUnits.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{UNIT}", safeUnits.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{CHANNELS}", safeChannels.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{CH_UNIT}", safeChannels.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{PAGES}", safePages.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{COPY}", safePages.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{NAS}", safeNas.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{DST}", dst.ToString("F2", CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
                .Replace("{SUR}", surcharge.ToString("F2", CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase);

            // Replace word boundary variables
            expr = Regex.Replace(expr, @"\bRATE\b", rate.ToString("F2", CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bYEARS\b", safeYears.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bYR\b", safeYears.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bUNITS\b", safeUnits.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bUNIT\b", safeUnits.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bCHANNELS\b", safeChannels.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bCH_UNIT\b", safeChannels.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bPAGES\b", safePages.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bCOPY\b", safePages.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bNAS\b", safeNas.ToString(CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bDST\b", dst.ToString("F2", CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);
            expr = Regex.Replace(expr, @"\bSUR\b", surcharge.ToString("F2", CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);

            // Replace statutory specific tariff acronyms with rate if present
            expr = Regex.Replace(expr, @"\b(ROC|LF|PF|PUR|POS|STF|REG|DEMO|PTR|SP|CPF|SUF|ARF1|ARF2|FF|AF|SEM|MOD|DUP|FC|SC)\b",
                rate.ToString("F2", CultureInfo.InvariantCulture), RegexOptions.IgnoreCase);

            // Handle implicit multiplication like (180)(3) -> (180)*(3) or 3(2) -> 3*(2) or (3)2 -> (3)*2
            expr = Regex.Replace(expr, @"\)\s*\(", ")*(");
            expr = Regex.Replace(expr, @"(\d+)\s*\(", "$1*(");
            expr = Regex.Replace(expr, @"\)\s*(\d+)", ")*$1");

            return EvaluateArithmetic(expr);
        }
        catch
        {
            return rate * Math.Max(1, years) * Math.Max(1, units);
        }
    }

    private static decimal EvaluateArithmetic(string expression)
    {
        var tokens = Tokenize(expression);
        if (tokens.Count == 0) return 0m;

        var index = 0;
        var result = ParseExpression(tokens, ref index);
        return Math.Round(result, 2, MidpointRounding.AwayFromZero);
    }

    private static List<string> Tokenize(string expr)
    {
        var tokens = new List<string>();
        var sb = new StringBuilder();

        for (var i = 0; i < expr.Length; i++)
        {
            var ch = expr[i];
            if (char.IsWhiteSpace(ch)) continue;

            if (char.IsDigit(ch) || ch == '.')
            {
                sb.Append(ch);
            }
            else if (ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '(' || ch == ')')
            {
                if (sb.Length > 0)
                {
                    tokens.Add(sb.ToString());
                    sb.Clear();
                }
                tokens.Add(ch.ToString());
            }
        }

        if (sb.Length > 0)
        {
            tokens.Add(sb.ToString());
        }

        return tokens;
    }

    private static decimal ParseExpression(List<string> tokens, ref int index)
    {
        var value = ParseTerm(tokens, ref index);

        while (index < tokens.Count)
        {
            var op = tokens[index];
            if (op == "+" || op == "-")
            {
                index++;
                var nextTerm = ParseTerm(tokens, ref index);
                value = op == "+" ? value + nextTerm : value - nextTerm;
            }
            else
            {
                break;
            }
        }

        return value;
    }

    private static decimal ParseTerm(List<string> tokens, ref int index)
    {
        var value = ParseFactor(tokens, ref index);

        while (index < tokens.Count)
        {
            var op = tokens[index];
            if (op == "*" || op == "/")
            {
                index++;
                var nextFactor = ParseFactor(tokens, ref index);
                if (op == "*")
                {
                    value *= nextFactor;
                }
                else
                {
                    value = nextFactor != 0 ? value / nextFactor : 0;
                }
            }
            else
            {
                break;
            }
        }

        return value;
    }

    private static decimal ParseFactor(List<string> tokens, ref int index)
    {
        if (index >= tokens.Count) return 0m;

        var token = tokens[index];

        // Unary plus or minus
        if (token == "-")
        {
            index++;
            return -ParseFactor(tokens, ref index);
        }
        if (token == "+")
        {
            index++;
            return ParseFactor(tokens, ref index);
        }

        if (token == "(")
        {
            index++;
            var result = ParseExpression(tokens, ref index);
            if (index < tokens.Count && tokens[index] == ")")
            {
                index++;
            }
            return result;
        }

        index++;
        if (decimal.TryParse(token, NumberStyles.Any, CultureInfo.InvariantCulture, out var num))
        {
            return num;
        }

        return 0m;
    }
}
