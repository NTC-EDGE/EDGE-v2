using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Element : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
}
