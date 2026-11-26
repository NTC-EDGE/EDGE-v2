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

    public async Task<MeetingPoll?> GetPollByIdAsync(Guid pollId, CancellationToken cancellationToken = default)
    {
        return await _context.MeetingPolls
            .Include(p => p.Votes)
            .Include(p => p.Meeting).ThenInclude(m => m.Participants)
            .FirstOrDefaultAsync(p => p.Id == pollId, cancellationToken);
    }

    public async Task<List<Meeting>> GetUpcomingMeetingsAsync(Guid userId, Guid? tenantId, CancellationToken cancellationToken = default)
    {
        return await GetMeetingsAsync(userId, tenantId, "active", cancellationToken);
    }

    public async Task<List<Meeting>> GetMeetingsAsync(Guid userId, Guid? tenantId, string? filter = null, CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var query = _context.Meetings
            .Include(m => m.HostUser)
            .Include(m => m.Tenant)
            .Include(m => m.Participants).ThenInclude(p => p.User)
            .Include(m => m.Polls).ThenInclude(p => p.Votes)
            .Where(m => !m.IsDeleted && (m.Participants.Any(p => p.UserId == userId && !p.IsDeleted) || m.HostUserId == userId));

        if (tenantId.HasValue)
        {
            query = query.Where(m => m.TenantId == tenantId
                                  || m.Scope == Domain.Enums.ConversationScope.InterRegional
                                  || m.Participants.Any(p => p.UserId == userId && !p.IsDeleted)
                                  || m.HostUserId == userId);
        }

        var normalizedFilter = filter?.Trim().ToLowerInvariant();

        if (normalizedFilter == "history")
        {
            query = query.Where(m => (m.Status == Domain.Enums.MeetingStatus.Ended || (m.Status == Domain.Enums.MeetingStatus.Scheduled && m.ScheduledEndTime != null && m.ScheduledEndTime < now)))
                         .Where(m => m.Status != Domain.Enums.MeetingStatus.Cancelled)
                         .OrderByDescending(m => m.ActualEndTime ?? m.ScheduledStartTime);
        }
        else if (normalizedFilter == "live")
        {
            query = query.Where(m => m.Status == Domain.Enums.MeetingStatus.Live)
                         .OrderByDescending(m => m.ActualStartTime ?? m.ScheduledStartTime);
        }
        else if (normalizedFilter == "upcoming")
        {
            query = query.Where(m => m.Status == Domain.Enums.MeetingStatus.Scheduled && (m.ScheduledEndTime == null || m.ScheduledEndTime >= now))
                         .OrderBy(m => m.ScheduledStartTime);
        }
        else if (normalizedFilter == "active")
        {
            query = query.Where(m => m.Status != Domain.Enums.MeetingStatus.Cancelled && (m.Status == Domain.Enums.MeetingStatus.Live || (m.Status == Domain.Enums.MeetingStatus.Scheduled && (m.ScheduledEndTime == null || m.ScheduledEndTime >= now))))
                         .OrderBy(m => m.ScheduledStartTime);
        }
        else
        {
            query = query.Where(m => m.Status != Domain.Enums.MeetingStatus.Cancelled)
                         .OrderByDescending(m => m.ScheduledStartTime);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Meeting> AddMeetingAsync(Meeting meeting, CancellationToken cancellationToken = default)
    {
        await _context.Meetings.AddAsync(meeting, cancellationToken);
        return meeting;
    }

    public async Task<MeetingParticipant> AddMeetingParticipantAsync(MeetingParticipant participant, CancellationToken cancellationToken = default)
    {
        await _context.MeetingParticipants.AddAsync(participant, cancellationToken);
        return participant;
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
            .CountAsync(p => p.MeetingId == meetingId && p.IsHandRaised && !p.IsDeleted, cancellationToken);
    }

    public async Task<List<MeetingParticipant>> GetAllParticipantsAsync(Guid meetingId, CancellationToken cancellationToken = default)
    {
        return await _context.MeetingParticipants
            .IgnoreQueryFilters()
            .Where(p => p.MeetingId == meetingId)
            .ToListAsync(cancellationToken);
    }
}
