using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class MeetingAction : AuditableEntity
{
    public Guid MeetingId { get; set; }
    public virtual Meeting Meeting { get; set; } = null!;

    public Guid ActorUserId { get; set; }
    public virtual User ActorUser { get; set; } = null!;

    public Guid? TargetUserId { get; set; }
    public virtual User? TargetUser { get; set; }

    public MeetingActionType ActionType { get; set; }
    public string? ActionPayload { get; set; }
}
