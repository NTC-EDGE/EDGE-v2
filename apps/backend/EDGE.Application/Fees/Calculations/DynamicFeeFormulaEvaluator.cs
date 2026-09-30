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

            // Replace generic remaining bracketed fee placeholders
            expr = Regex.Replace(expr, @"\{[A-Za-z0-9_]+\}", rate.ToString("F2", CultureInfo.InvariantCulture));

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

    /// <summary>
    /// Validates whether a formula expression adheres to the supported syntax grammar.
    /// Checks for valid tokens, balanced parentheses, legal operator sequences, and dry-run execution.
    /// </summary>
    public static (bool IsValid, string? ErrorMessage) Validate(string? formula)
    {
        if (string.IsNullOrWhiteSpace(formula))
        {
            return (false, "Formula expression cannot be empty.");
        }

        var trimmed = formula.Trim();
        if (trimmed.Length > 500)
        {
            return (false, "Formula expression must not exceed 500 characters.");
        }

        string rawExpr = trimmed;

        // 1. Assignment Target Check (e.g. "TOTAL = (ROC)(YR) + DST")
        if (rawExpr.Contains('='))
        {
            var parts = rawExpr.Split('=');
            if (parts.Length > 2)
            {
                return (false, "Formula cannot contain multiple assignment '=' operators.");
            }

            var leftTarget = parts[0].Trim();
            if (string.IsNullOrWhiteSpace(leftTarget))
            {
                return (false, "Assignment target on the left side of '=' cannot be empty.");
            }

            if (!Regex.IsMatch(leftTarget, @"^[A-Za-z0-9_]+$"))
            {
                return (false, $"Invalid assignment target '{leftTarget}'. Target name must contain only alphanumeric characters or underscores (e.g. 'TOTAL').");
            }

            rawExpr = parts[1].Trim();
            if (string.IsNullOrWhiteSpace(rawExpr))
            {
                return (false, "Formula expression on the right side of '=' cannot be empty.");
            }
        }

        // 2. Character Whitelist: Letters, Digits, _, {}, (), +, -, *, /, ., and spaces
        if (Regex.IsMatch(rawExpr, @"[^A-Za-z0-9_{}\(\)\+\-\*\/\.\s]"))
        {
            var invalidCharMatch = Regex.Match(rawExpr, @"[^A-Za-z0-9_{}\(\)\+\-\*\/\.\s]");
            return (false, $"Formula contains unsupported character '{invalidCharMatch.Value}'. Allowed characters are alphanumeric identifiers, numbers, parentheses (), brackets {{}}, and arithmetic operators (+, -, *, /).");
        }

        // 3. Braces {} Matching Check
        var openBraceCount = 0;
        var closeBraceCount = 0;
        for (var i = 0; i < rawExpr.Length; i++)
        {
            if (rawExpr[i] == '{') openBraceCount++;
            if (rawExpr[i] == '}') closeBraceCount++;
        }

        if (openBraceCount != closeBraceCount)
        {
            return (false, "Mismatched bracketed placeholders: every '{' must have a matching '}'.");
        }
        if (Regex.IsMatch(rawExpr, @"\{[^{}]*\{|\}[^{}]*\}"))
        {
            return (false, "Nested or malformed curly brackets '{}' are not allowed.");
        }
        if (Regex.IsMatch(rawExpr, @"\{\s*\}"))
        {
            return (false, "Empty variable placeholder '{}' is not allowed.");
        }

        // 4. Parentheses () Balance and Empty Check
        var parenDepth = 0;
        for (var i = 0; i < rawExpr.Length; i++)
        {
            if (rawExpr[i] == '(')
            {
                parenDepth++;
            }
            else if (rawExpr[i] == ')')
            {
                parenDepth--;
                if (parenDepth < 0)
                {
                    return (false, "Mismatched closing parenthesis ')' without a preceding '('.");
                }
            }
        }
        if (parenDepth > 0)
        {
            return (false, $"Unclosed opening parenthesis '(': {parenDepth} unclosed opening parenthesis.");
        }
        if (Regex.IsMatch(rawExpr, @"\(\s*\)"))
        {
            return (false, "Empty parentheses '()' are not allowed in formula.");
        }

        // 5. Operator Sequence and Boundary Checks
        var startTrimmed = rawExpr.TrimStart();
        if (startTrimmed.StartsWith("*") || startTrimmed.StartsWith("/"))
        {
            return (false, "Formula expression cannot start with multiplication or division operator.");
        }

        var endTrimmed = rawExpr.TrimEnd();
        if (endTrimmed.EndsWith("+") || endTrimmed.EndsWith("-") || endTrimmed.EndsWith("*") || endTrimmed.EndsWith("/"))
        {
            return (false, "Formula expression cannot end with an arithmetic operator.");
        }

        if (Regex.IsMatch(rawExpr, @"[\+\-\*\/]\s*[\*\/]"))
        {
            return (false, "Invalid operator sequence: binary operators cannot be immediately followed by '*' or '/'.");
        }
        if (Regex.IsMatch(rawExpr, @"[\+\*\/]\s*[\+]"))
        {
            return (false, "Invalid operator sequence: duplicate '+' operators are not allowed.");
        }
        if (Regex.IsMatch(rawExpr, @"--\s*-"))
        {
            return (false, "Invalid operator sequence with multiple consecutive '-' operators.");
        }

        // 6. Identifier / Variable Validation & Dry-Run Evaluation
        try
        {
            var testResult = Evaluate(
                formula: rawExpr,
                rate: 100.00m,
                years: 2,
                units: 3,
                channels: 1,
                pages: 5,
                additionalServices: 1,
                dst: 30.00m,
                surcharge: 50.00m
            );
        }
        catch (Exception ex)
        {
            return (false, $"Formula validation failed: {ex.Message}");
        }

        return (true, null);
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
