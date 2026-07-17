using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class RolePermission : AuditableEntity
{
    public Guid PermissionId { get; set; }
    public virtual Permission Permission { get; set; } = null!;
    public Guid RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;
}
