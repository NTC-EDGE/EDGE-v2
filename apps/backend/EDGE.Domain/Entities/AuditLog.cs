using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string EntityName { get; set; } = null!;
    public string Action { get; set; } = null!; // Insert, Update, Delete
    public string? ChangedBy { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string? KeyValues { get; set; }  // JSON representation of primary keys
    public string? OldValues { get; set; }  // JSON representation of old states
    public string? NewValues { get; set; }  // JSON representation of new states
}
