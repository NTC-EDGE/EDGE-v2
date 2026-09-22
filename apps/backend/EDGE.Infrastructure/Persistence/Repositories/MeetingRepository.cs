using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class MeetingRepository : IMeetingRepository
{
    private readonly ApplicationDbContext _context;

    public MeetingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Meeting?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Meetings
            .Include(m => m.HostUser)
            .Include(m => m.Tenant)
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .Include(m => m.Polls).ThenInclude(p => p.Votes)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<Meeting?> GetByCodeAsync(string meetingCode, CancellationToken cancellationToken = default)
    {
        return await _context.Meetings
            .Include(m => m.HostUser)
            .Include(m => m.Tenant)
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .Include(m => m.Polls).ThenInclude(p => p.Votes)
            .FirstOrDefaultAsync(m => m.MeetingCode == meetingCode, cancellationToken);
    }

    public async Task<List<Meeting>> GetUpcomingMeetingsAsync(Guid userId, Guid? tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Meetings
            .Include(m => m.HostUser)
            .Include(m => m.Tenant)
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .Where(m => m.Participants.Any(p => p.UserId == userId) || m.HostUserId == userId)
            .OrderBy(m => m.ScheduledStartTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<Meeting> AddMeetingAsync(Meeting meeting, CancellationToken cancellationToken = default)
    {
        await _context.Meetings.AddAsync(meeting, cancellationToken);
        return meeting;
    }

    public async Task<MeetingAction> AddMeetingActionAsync(MeetingAction action, CancellationToken cancellationToken = default)
    {
        await _context.MeetingActions.AddAsync(action, cancellationToken);
        return action;
    }

    public async Task<MeetingPoll> AddMeetingPollAsync(MeetingPoll poll, CancellationToken cancellationToken = default)
    {
        await _context.MeetingPolls.AddAsync(poll, cancellationToken);
        return poll;
    }

    public async Task<MeetingPollVote> AddMeetingPollVoteAsync(MeetingPollVote vote, CancellationToken cancellationToken = default)
    {
        await _context.MeetingPollVotes.AddAsync(vote, cancellationToken);
        return vote;
    }

    public async Task<int> GetHandRaiseQueueCountAsync(Guid meetingId, CancellationToken cancellationToken = default)
    {
        return await _context.MeetingParticipants
            .CountAsync(p => p.MeetingId == meetingId && p.IsHandRaised, cancellationToken);
    }

    public async Task<List<MeetingParticipant>> GetAllParticipantsAsync(Guid meetingId, CancellationToken cancellationToken = default)
    {
        return await _context.MeetingParticipants
            .IgnoreQueryFilters()
            .Where(p => p.MeetingId == meetingId)
            .ToListAsync(cancellationToken);
    }
}
