using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid? TenantId { get; set; }
    public string EntityName { get; set; } = null!;
    public string Action { get; set; } = null!; // Insert, Update, Delete, User Login, etc.
    public string? Event { get; set; }
    public string? ChangedBy { get; set; }
    public string? Resource { get; set; }
    public string? IpAddress { get; set; }
    public string? Status { get; set; } // Success, Warning, Error
    public string? Type { get; set; } // Auth, Security, Data, System, User
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string? KeyValues { get; set; }  // JSON representation of primary keys
    public string? OldValues { get; set; }  // JSON representation of old states
    public string? NewValues { get; set; }  // JSON representation of new states
}
