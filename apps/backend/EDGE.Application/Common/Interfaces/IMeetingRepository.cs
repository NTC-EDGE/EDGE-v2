using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IMeetingRepository
{
    Task<Meeting?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Meeting?> GetByCodeAsync(string meetingCode, CancellationToken cancellationToken = default);
    Task<List<Meeting>> GetUpcomingMeetingsAsync(Guid userId, Guid? tenantId, CancellationToken cancellationToken = default);
    Task<Meeting> AddMeetingAsync(Meeting meeting, CancellationToken cancellationToken = default);
    Task<MeetingAction> AddMeetingActionAsync(MeetingAction action, CancellationToken cancellationToken = default);
    Task<MeetingPoll> AddMeetingPollAsync(MeetingPoll poll, CancellationToken cancellationToken = default);
    Task<MeetingPollVote> AddMeetingPollVoteAsync(MeetingPollVote vote, CancellationToken cancellationToken = default);
    Task<int> GetHandRaiseQueueCountAsync(Guid meetingId, CancellationToken cancellationToken = default);
    Task<List<MeetingParticipant>> GetAllParticipantsAsync(Guid meetingId, CancellationToken cancellationToken = default);
}
