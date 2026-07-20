using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class TenantMember : AuditableEntity
{
    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;

    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }

    public string? JobTitle { get; set; }
    public string? Level { get; set; }
    public string Division { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? Designation { get; set; }
}
