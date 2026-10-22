using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class MeetingPoll : AuditableEntity
{
    public Guid MeetingId { get; set; }
    public virtual Meeting Meeting { get; set; } = null!;

    public string Question { get; set; } = string.Empty;
    public string OptionsJson { get; set; } = string.Empty;
    public bool IsClosed { get; set; } = false;
    public bool IsAnonymous { get; set; } = false;

    public virtual ICollection<MeetingPollVote> Votes { get; set; } = new List<MeetingPollVote>();
}
