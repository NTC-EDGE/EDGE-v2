using System.Text.Json.Serialization;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Role : AuditableEntity
{
    public Guid? TenantId { get; set; }
    public virtual Tenant? Tenant { get; set; }
    public bool IsSystemRole { get; set; } = false;

    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string? Description { get; set; }

    [JsonIgnore]
    public virtual List<RolePermission> RolePermissions { get; set; } = [];

    [JsonIgnore]
    public virtual List<TenantMember> Members { get; set; } = [];
}
