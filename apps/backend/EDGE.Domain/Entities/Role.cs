using System.Text.Json.Serialization;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Role : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string? Description { get; set; }

    [JsonIgnore]
    public virtual List<RolePermission> RolePermissions { get; set; } = [];

    [JsonIgnore]
    public virtual List<User> Users { get; set; } = [];
}
