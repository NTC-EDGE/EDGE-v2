using System;
using System.Collections.Generic;
using System.Text.Json;

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

