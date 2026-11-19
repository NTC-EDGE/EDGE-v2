using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;
using EDGE.Infrastructure.Hubs;

namespace EDGE.Infrastructure.Services;

public class MeetingNotificationService : IMeetingNotificationService
{
    private readonly IHubContext<MeetingHub, IMeetingClient> _hubContext;

    public MeetingNotificationService(IHubContext<MeetingHub, IMeetingClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyIncomingCallAsync(MeetingDto meeting, List<Guid> targetUserIds, CancellationToken cancellationToken = default)
    {
        var callInfo = new
        {
            meetingId = meeting.Id,
            meetingCode = meeting.MeetingCode,
            title = meeting.Title,
            scope = meeting.Scope.ToString(),
            tenantName = meeting.TenantName,
            hostUserId = meeting.HostUserId,
            hostUserName = meeting.HostUserName,
            scheduledStartTime = meeting.ScheduledStartTime
        };

        foreach (var userId in targetUserIds)
        {
            await _hubContext.Clients.Group($"user_{userId}").OnIncomingCall(callInfo);
        }
    }

    public async Task NotifyMeetingEndedAsync(string meetingCode, CancellationToken cancellationToken = default)
    {
        MeetingHub.ClearRoomState(meetingCode);
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnMeetingEnded(meetingCode);
        await _hubContext.Clients.Group($"meet_waiting_{meetingCode}").OnMeetingEnded(meetingCode);
    }

    public async Task NotifyHostChangedAsync(string meetingCode, Guid newHostUserId, string newHostUserName, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnHostChanged(newHostUserId, newHostUserName);
    }

    public async Task NotifyHandRaisedAsync(string meetingCode, Guid userId, string userName, int queuePosition, CancellationToken cancellationToken = default)
    {
        MeetingHub.SyncHandRaiseState(meetingCode, userId, true, queuePosition);
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnUserRaisedHand(userId, userName, queuePosition);
    }

    public async Task NotifyHandLoweredAsync(string meetingCode, Guid userId, CancellationToken cancellationToken = default)
    {
        MeetingHub.SyncHandRaiseState(meetingCode, userId, false, null);
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnUserLoweredHand(userId);
    }

    public async Task NotifyParticipantMutedAsync(string meetingCode, Guid? targetUserId, Guid mutedByUserId, CancellationToken cancellationToken = default)
    {
        MeetingHub.SyncHostMuteState(meetingCode, targetUserId, mutedByUserId);
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnParticipantMuted(targetUserId, mutedByUserId);
    }

    public async Task NotifyParticipantSpotlightedAsync(string meetingCode, Guid? targetUserId, CancellationToken cancellationToken = default)
    {
        MeetingHub.SyncSpotlightState(meetingCode, targetUserId);
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnSpeakerSpotlighted(targetUserId);
    }

    public async Task NotifyParticipantKickedAsync(string meetingCode, Guid targetUserId, string reason = "Removed by meeting host.", CancellationToken cancellationToken = default)
    {
        var evictedConns = MeetingHub.EvictUserConnections(meetingCode, targetUserId);
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnParticipantKicked(targetUserId, reason);
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnParticipantLeft(targetUserId);

        foreach (var connId in evictedConns)
        {
            await _hubContext.Groups.RemoveFromGroupAsync(connId, $"meet_{meetingCode}", cancellationToken);
        }
    }

    public async Task NotifyPollCreatedAsync(string meetingCode, MeetingPollDto poll, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnPollCreated(poll);
    }

    public async Task NotifyPollUpdatedAsync(string meetingCode, MeetingPollDto poll, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnPollVoteUpdated(poll.Id, poll);
    }

    public async Task NotifyPollClosedAsync(string meetingCode, Guid pollId, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnPollClosed(pollId);
    }
}
