using System;

namespace EDGE.Application.Forms.Dtos;

public class FormFieldDto
{
    public Guid Id { get; set; }
    public string FieldType { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? ValidationRules { get; set; }
    public bool IsRequired { get; set; }
    public int OrderIndex { get; set; }
    public string? VisibilityCondition { get; set; }
    public bool SyncBackOnSubmit { get; set; }
}
