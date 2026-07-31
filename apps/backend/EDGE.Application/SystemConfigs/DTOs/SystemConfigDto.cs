using System;

namespace EDGE.Application.SystemConfigs.DTOs;

public class SystemConfigDto
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DataType { get; set; } = "String";
    public bool IsPublic { get; set; }
    public DateTime? LastModifiedAt { get; set; }
}
