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
        await _hubContext.Clients.Group($"meet_{meetingCode}").OnMeetingEnded(meetingCode);
    }
}
