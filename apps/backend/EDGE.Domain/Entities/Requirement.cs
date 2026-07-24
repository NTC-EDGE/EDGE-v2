using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Requirement : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
