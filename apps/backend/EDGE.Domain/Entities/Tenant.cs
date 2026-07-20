using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Tenant : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual List<TenantMember> Members { get; set; } = [];
    public virtual List<Role> Roles { get; set; } = [];
}
