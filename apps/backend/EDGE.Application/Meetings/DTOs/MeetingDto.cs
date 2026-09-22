using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.DTOs;

public class MeetingParticipantDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public ParticipantRole Role { get; set; }
    public bool IsHandRaised { get; set; }
    public int? HandRaiseQueuePosition { get; set; }
    public bool IsMutedByHost { get; set; }
    public bool IsSpotlighted { get; set; }
}

public class MeetingPollVoteDto
{
    public Guid UserId { get; set; }
    public int SelectedOptionIndex { get; set; }
}

public class MeetingPollDto
{
    public Guid Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public bool IsClosed { get; set; }
    public bool IsAnonymous { get; set; }
    public List<MeetingPollVoteDto> Votes { get; set; } = new();
}

public class MeetingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string MeetingCode { get; set; } = string.Empty;
    public ConversationScope Scope { get; set; }
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public Guid HostUserId { get; set; }
    public string HostUserName { get; set; } = string.Empty;
    public DateTimeOffset ScheduledStartTime { get; set; }
    public DateTimeOffset? ScheduledEndTime { get; set; }
    public MeetingStatus Status { get; set; }
    public List<MeetingParticipantDto> Participants { get; set; } = new();
    public List<MeetingPollDto> Polls { get; set; } = new();
}
