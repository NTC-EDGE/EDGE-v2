using System;

namespace EDGE.Application.Forms.Dtos;

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
    public string? Value { get; set; }
}
