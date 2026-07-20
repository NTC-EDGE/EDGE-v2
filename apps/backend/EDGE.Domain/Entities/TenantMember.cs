using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class TenantMember : AuditableEntity
{
    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;

    public Guid UserId { get; set; }

    public string JobTitle { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? Department { get; set; }
    public bool IsAdmin { get; set; } = false;
    public bool IsActive { get; set; } = true;
}
