using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class DocumentType : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General"; // "Licensing", "Permit", "Identification", "Technical"
    public bool IsActive { get; set; } = true;
}
