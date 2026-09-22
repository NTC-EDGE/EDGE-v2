using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class MeetingPollVote : AuditableEntity
{
    public Guid MeetingPollId { get; set; }
    public virtual MeetingPoll MeetingPoll { get; set; } = null!;

    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public int SelectedOptionIndex { get; set; }
}
