using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class SystemConfig : AuditableEntity
{
    public string Category { get; set; } = "General"; // "General", "Security", "Email", "Upload", "Maintenance"
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DataType { get; set; } = "String"; // "String", "Boolean", "Number", "Json"
    public bool IsPublic { get; set; } = false;
}
