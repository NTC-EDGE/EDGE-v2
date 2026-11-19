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
    Task NotifyHandRaisedAsync(string meetingCode, Guid userId, string userName, int queuePosition, CancellationToken cancellationToken = default);
    Task NotifyHandLoweredAsync(string meetingCode, Guid userId, CancellationToken cancellationToken = default);
    Task NotifyParticipantMutedAsync(string meetingCode, Guid? targetUserId, Guid mutedByUserId, CancellationToken cancellationToken = default);
    Task NotifyParticipantSpotlightedAsync(string meetingCode, Guid? targetUserId, CancellationToken cancellationToken = default);
    Task NotifyParticipantKickedAsync(string meetingCode, Guid targetUserId, string reason = "Removed by meeting host.", CancellationToken cancellationToken = default);
    Task NotifyPollCreatedAsync(string meetingCode, MeetingPollDto poll, CancellationToken cancellationToken = default);
    Task NotifyPollUpdatedAsync(string meetingCode, MeetingPollDto poll, CancellationToken cancellationToken = default);
    Task NotifyPollClosedAsync(string meetingCode, Guid pollId, CancellationToken cancellationToken = default);
}
