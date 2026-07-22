using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Field : AuditableEntity
{
    public string FieldType { get; set; } = string.Empty; // text | date | dropdown | checkbox | signature | file
    public string Label { get; set; } = string.Empty;
    public string? ValidationRules { get; set; } // JSON
    public bool IsOtherEnabled { get; set; }
    public bool SyncBackOnSubmit { get; set; }
}
