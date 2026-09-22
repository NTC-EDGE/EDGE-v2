using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class Conversation : AuditableEntity
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public ConversationType Type { get; set; } = ConversationType.Direct;
    public ConversationScope Scope { get; set; } = ConversationScope.IntraRegional;
    
    public Guid? TenantId { get; set; }
    public virtual Tenant? Tenant { get; set; }

    public bool IsArchived { get; set; } = false;
    public DateTimeOffset? LastMessageAt { get; set; }
    public string? LastMessagePreview { get; set; }

    public virtual ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
    public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
