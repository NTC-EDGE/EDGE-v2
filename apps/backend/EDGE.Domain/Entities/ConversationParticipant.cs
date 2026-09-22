using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ConversationParticipant : AuditableEntity
{
    public Guid ConversationId { get; set; }
    public virtual Conversation Conversation { get; set; } = null!;

    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;

    public ParticipantRole Role { get; set; } = ParticipantRole.Member;
    public bool IsMuted { get; set; } = false;
    public DateTimeOffset? LastReadAt { get; set; }
    public Guid? LastReadMessageId { get; set; }
    public bool HasLeft { get; set; } = false;
    public DateTimeOffset? LeftAt { get; set; }
}
