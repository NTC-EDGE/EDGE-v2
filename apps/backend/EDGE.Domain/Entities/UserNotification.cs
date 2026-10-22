using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class UserNotification : AuditableEntity
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public Guid? TenantId { get; set; }
    public virtual Tenant? Tenant { get; set; }

    public NotificationType Type { get; set; } = NotificationType.ChatMessage;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    
    public bool IsRead { get; set; } = false;
    public DateTimeOffset? ReadAt { get; set; }
    
    public string? ReferenceId { get; set; }
}
