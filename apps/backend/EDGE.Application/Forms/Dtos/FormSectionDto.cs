using System;
using System.Collections.Generic;
using System.Text.Json;
using EDGE.Domain.Entities;

namespace EDGE.Application.Forms.Dtos;

public class FormSectionDto
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    /// <summary>
    /// Derived from the Service contract's requiredSections list.
    /// True when this section's key appears in contract.requiredSections with required=true.
    /// Justine's frontend uses this to mark sections mandatory before submission.
    /// </summary>
    public bool Required { get; set; }
    public int OrderIndex { get; set; }
    public string? VisibilityCondition { get; set; }
    public List<FormFieldDto> Fields { get; set; } = new();

    public static string? ExtractSectionVisibilityCondition(IEnumerable<SectionField>? sectionFields)
    {
        if (sectionFields == null) return null;
        foreach (var sf in sectionFields)
        {
            var rules = sf.Field?.ValidationRules;
            if (string.IsNullOrWhiteSpace(rules)) continue;
            var trimmed = rules.Trim();
            if (!trimmed.StartsWith("{", StringComparison.Ordinal)) continue;
            try
            {
                using var doc = JsonDocument.Parse(trimmed);
                if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                    doc.RootElement.TryGetProperty("sectionVisibilityCondition", out var secVis) &&
                    secVis.ValueKind == JsonValueKind.String)
                {
                    var val = secVis.GetString();
                    if (!string.IsNullOrWhiteSpace(val)) return val;
                }
            }
            catch
            {
                // Ignore malformed JSON
            }
        }
        return null;
    }

    public static string ResolveTitle(FormSection section, ServiceVariant? activeVariant = null)
    {
        if (activeVariant == null || section.SectionFields == null) return section.Title;
        foreach (var sf in section.SectionFields)
        {
            var rules = sf.Field?.ValidationRules;
            if (string.IsNullOrWhiteSpace(rules) || !rules.Trim().StartsWith("{", StringComparison.Ordinal)) continue;
            try
            {
                using var doc = JsonDocument.Parse(rules.Trim());
                if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                    doc.RootElement.TryGetProperty("sectionVariantTitles", out var titlesEl) &&
                    titlesEl.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in titlesEl.EnumerateObject())
                    {
                        if (FormFieldDto.MatchesServiceVariant(prop.Name, activeVariant) &&
                            prop.Value.ValueKind == JsonValueKind.String &&
                            !string.IsNullOrWhiteSpace(prop.Value.GetString()))
                        {
                            return prop.Value.GetString()!;
                        }
                    }
                }
            }
            catch { /* ignore */ }
        }
        return section.Title;
    }
}
