using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class RolePermission : AuditableEntity
{
    public string PermissionKey { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;
}
