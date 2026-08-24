using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Tenant : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = false;
    public Guid RegionId { get; set; }

    // Navigation property
    public virtual ICollection<TenantMember> Members { get; set; } = new List<TenantMember>();
    public virtual Region Region { get; set; } = null!;
}
