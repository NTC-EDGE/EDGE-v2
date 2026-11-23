using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Forms.Dtos;

public class FormFieldOptionDto
{
    public string? Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class FormFieldDto
{
    /// <summary>
    /// The FieldId (GUID) — the frontend sends this back as the key in form submission payloads.
    /// </summary>
    public Guid FieldId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public int OrderIndex { get; set; }
    public string? ValidationRules { get; set; }
    public string? VisibilityCondition { get; set; }
    public List<FormFieldOptionDto>? Options { get; set; }

    public static FormFieldDto FromSectionField(SectionField sf, ServiceVariant? activeVariant = null, Guid? formId = null)
    {
        var label = sf.Field?.Label ?? string.Empty;
        var type = sf.Field?.FieldType ?? string.Empty;
        var isRequired = sf.IsRequired;
        var validationRules = sf.Field?.ValidationRules;

        if (activeVariant != null && !string.IsNullOrWhiteSpace(validationRules) &&
            validationRules.Trim().StartsWith("{", StringComparison.Ordinal))
        {
            try
            {
                using var doc = JsonDocument.Parse(validationRules.Trim());
                if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                    doc.RootElement.TryGetProperty("variantOverrides", out var overridesEl) &&
                    overridesEl.ValueKind == JsonValueKind.Object)
                {
                    JsonElement? matchedOv = null;
                    string formScopedSuffix = formId.HasValue && formId.Value != Guid.Empty
                        ? $"::form::{formId.Value}"
                        : string.Empty;

                    // 1. Prefer version-specific override if loading a specific Draft variant version
                    if (!string.IsNullOrEmpty(formScopedSuffix))
                    {
                        foreach (var prop in overridesEl.EnumerateObject())
                        {
                            if (prop.Name.EndsWith(formScopedSuffix, StringComparison.OrdinalIgnoreCase) &&
                                prop.Value.ValueKind == JsonValueKind.Object)
                            {
                                matchedOv = prop.Value;
                                break;
                            }
                        }
                    }

                    // 2. Otherwise fall back to the active variant override
                    if (!matchedOv.HasValue)
                    {
                        foreach (var prop in overridesEl.EnumerateObject())
                        {
                            if (prop.Name.Contains("::form::", StringComparison.OrdinalIgnoreCase)) continue;
                            if (MatchesServiceVariant(prop.Name, activeVariant) && prop.Value.ValueKind == JsonValueKind.Object)
                            {
                                matchedOv = prop.Value;
                                break;
                            }
                        }
                    }

                    if (matchedOv.HasValue)
                    {
                        var ov = matchedOv.Value;
                        if (ov.TryGetProperty("label", out var lblEl) && lblEl.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(lblEl.GetString()))
                        {
                            label = lblEl.GetString()!;
                        }
                        if (ov.TryGetProperty("required", out var reqEl) && (reqEl.ValueKind == JsonValueKind.True || reqEl.ValueKind == JsonValueKind.False))
                        {
                            isRequired = reqEl.GetBoolean();
                        }

                        var updatedNode = JsonNode.Parse(validationRules.Trim()) as JsonObject;
                        if (updatedNode != null)
                        {
                            if (ov.TryGetProperty("placeholder", out var phEl) && phEl.ValueKind == JsonValueKind.String)
                                updatedNode["placeholder"] = phEl.GetString();
                            if (ov.TryGetProperty("helpText", out var htEl) && htEl.ValueKind == JsonValueKind.String)
                                updatedNode["helpText"] = htEl.GetString();
                            if (ov.TryGetProperty("options", out var optEl) && optEl.ValueKind == JsonValueKind.Array)
                                updatedNode["options"] = JsonNode.Parse(optEl.GetRawText());
                            updatedNode.Remove("variantOverrides");
                            updatedNode.Remove("sectionVariantTitles");
                            validationRules = updatedNode.ToJsonString();
                        }
                    }
                }
            }
            catch
            {
                // Ignore JSON parse errors
            }
        }

        return new FormFieldDto
        {
            FieldId = sf.FieldId,
            Label = label,
            Type = type,
            IsRequired = isRequired,
            OrderIndex = sf.OrderIndex,
            ValidationRules = validationRules,
            VisibilityCondition = sf.VisibilityCondition,
            Options = ExtractOptions(validationRules)
        };
    }

    internal static bool MatchesServiceVariant(string ruleToken, ServiceVariant variant)
    {
        if (string.IsNullOrWhiteSpace(ruleToken)) return false;
        var trimmed = ruleToken.Trim();
        if (Guid.TryParse(trimmed, out var g) && g == variant.Id) return true;

        static string Norm(string? s) => string.IsNullOrWhiteSpace(s)
            ? string.Empty
            : Regex.Replace(s.Trim().ToLowerInvariant(), "[^a-z0-9]", string.Empty);

        var typeLabel = variant.Type switch
        {
            ServiceVariantType.NA => string.Empty,
            ServiceVariantType.FirstTaker => "First Taker",
            ServiceVariantType.CivicActionGroup => "Civic Action Group",
            _ => variant.Type.ToString()
        };
        var desc = (variant.Description ?? string.Empty).Trim();
        var displayName = string.IsNullOrEmpty(desc)
            ? (string.IsNullOrEmpty(typeLabel) ? "Variant" : typeLabel)
            : (string.IsNullOrEmpty(typeLabel) || desc.EndsWith($"({typeLabel})", StringComparison.OrdinalIgnoreCase)
                ? desc
                : $"{desc} ({typeLabel})");

        var normRule = Norm(trimmed);
        var normDisplay = Norm(displayName);
        var normRaw = Norm(!string.IsNullOrEmpty(desc) && variant.Type != ServiceVariantType.NA ? $"{desc} ({variant.Type})" : desc);
        var normType = variant.Type == ServiceVariantType.NA ? string.Empty : Norm(variant.Type.ToString());

        return normRule.Length > 0 && (normRule == normDisplay || normRule == normRaw || (!string.IsNullOrEmpty(normType) && normRule == normType));
    }

    public static List<FormFieldOptionDto>? ExtractOptions(string? validationRules)
    {
        if (string.IsNullOrWhiteSpace(validationRules)) return null;

        try
        {
            using var doc = JsonDocument.Parse(validationRules);
            JsonElement root = doc.RootElement;
            JsonElement optionsElement = default;

            if (root.ValueKind == JsonValueKind.Array)
            {
                optionsElement = root;
            }
            else if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("options", out var optProp) && optProp.ValueKind == JsonValueKind.Array)
            {
                optionsElement = optProp;
            }

            if (optionsElement.ValueKind == JsonValueKind.Array)
            {
                var options = new List<FormFieldOptionDto>();
                foreach (var item in optionsElement.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        var str = item.GetString()?.Trim();
                        if (!string.IsNullOrEmpty(str))
                        {
                            options.Add(new FormFieldOptionDto { Label = str, Value = str });
                        }
                    }
                    else if (item.ValueKind == JsonValueKind.Object)
                    {
                        string? id = item.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.String ? idProp.GetString() : null;
                        string? label = item.TryGetProperty("label", out var lblProp) && lblProp.ValueKind == JsonValueKind.String ? lblProp.GetString() : null;
                        string? val = item.TryGetProperty("value", out var valProp) && valProp.ValueKind == JsonValueKind.String ? valProp.GetString() : null;

                        if (string.IsNullOrEmpty(label) && !string.IsNullOrEmpty(val)) label = val;
                        if (string.IsNullOrEmpty(val) && !string.IsNullOrEmpty(label)) val = label;
                        if (!string.IsNullOrEmpty(label) && !string.IsNullOrEmpty(val))
                        {
                            bool isDefaultLabel = System.Text.RegularExpressions.Regex.IsMatch(
                                label.Trim(),
                                @"^Option\s*\d+$",
                                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                            bool isDefaultVal = System.Text.RegularExpressions.Regex.IsMatch(
                                val.Trim(),
                                @"^option[_\s]*\d+$",
                                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                            if (isDefaultLabel && !isDefaultVal)
                            {
                                label = val;
                            }
                            else if (isDefaultVal && !isDefaultLabel)
                            {
                                val = label;
                            }
                        }

                        if (!string.IsNullOrEmpty(label) || !string.IsNullOrEmpty(val))
                        {
                            options.Add(new FormFieldOptionDto
                            {
                                Id = id,
                                Label = label ?? string.Empty,
                                Value = val ?? string.Empty
                            });
                        }
                    }
                }
                return options.Count > 0 ? options : null;
            }
        }
        catch
        {
            // Ignore JSON parse errors
        }

        return null;
    }
}

