using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class Meeting : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string MeetingCode { get; set; } = string.Empty;
    public string? PasscodeHash { get; set; }
    
    public ConversationScope Scope { get; set; } = ConversationScope.IntraRegional;
    public Guid? TenantId { get; set; }
    public virtual Tenant? Tenant { get; set; }

    public Guid HostUserId { get; set; }
    public virtual User HostUser { get; set; } = null!;

    public Guid? LinkedConversationId { get; set; }
    public virtual Conversation? LinkedConversation { get; set; }

    public DateTimeOffset ScheduledStartTime { get; set; }
    public DateTimeOffset? ScheduledEndTime { get; set; }
    public DateTimeOffset? ActualStartTime { get; set; }
    public DateTimeOffset? ActualEndTime { get; set; }
    public MeetingStatus Status { get; set; } = MeetingStatus.Scheduled;

    public bool AllowExternalGuests { get; set; } = false;
    public bool IsRecordingEnabled { get; set; } = false;

    public virtual ICollection<MeetingParticipant> Participants { get; set; } = new List<MeetingParticipant>();
    public virtual ICollection<MeetingAction> Actions { get; set; } = new List<MeetingAction>();
    public virtual ICollection<MeetingPoll> Polls { get; set; } = new List<MeetingPoll>();
}
