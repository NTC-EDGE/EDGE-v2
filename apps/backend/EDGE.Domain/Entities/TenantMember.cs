using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class TenantMember : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public string? JobTitle { get; set; }
    public string? Level { get; set; }
    public string Division { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public virtual Role Role { get; set; } = null!;
    public virtual User User { get; set; } = null!;
    public virtual Tenant Tenant { get; set; } = null!;
}
