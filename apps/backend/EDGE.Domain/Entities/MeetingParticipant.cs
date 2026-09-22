using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class MeetingParticipant : AuditableEntity
{
    public Guid MeetingId { get; set; }
    public virtual Meeting Meeting { get; set; } = null!;

    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;

    public ParticipantRole Role { get; set; } = ParticipantRole.Member;
    public bool IsHandRaised { get; set; } = false;
    public int? HandRaiseQueuePosition { get; set; }
    public DateTimeOffset? HandRaisedAt { get; set; }

    public bool IsMutedByHost { get; set; } = false;
    public bool IsSpotlighted { get; set; } = false;

    public DateTimeOffset? JoinedAt { get; set; }
    public DateTimeOffset? LeftAt { get; set; }
}
