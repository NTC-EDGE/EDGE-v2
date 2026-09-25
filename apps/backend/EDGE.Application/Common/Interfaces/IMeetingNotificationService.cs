using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Meetings.DTOs;

namespace EDGE.Application.Common.Interfaces;

public interface IMeetingNotificationService
{
    Task NotifyIncomingCallAsync(MeetingDto meeting, List<Guid> targetUserIds, CancellationToken cancellationToken = default);
    Task NotifyMeetingEndedAsync(string meetingCode, CancellationToken cancellationToken = default);
    Task NotifyHostChangedAsync(string meetingCode, Guid newHostUserId, string newHostUserName, CancellationToken cancellationToken = default);
}
