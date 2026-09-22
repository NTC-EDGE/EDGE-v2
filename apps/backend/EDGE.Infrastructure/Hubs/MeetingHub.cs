using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Hubs;

[Authorize]
public class MeetingHub : Hub<IMeetingClient>
{
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> ConnectionMeetings = new();
    private readonly IMeetingRepository _meetingRepository;

    public MeetingHub(IMeetingRepository meetingRepository)
    {
        _meetingRepository = meetingRepository;
    }

    public async Task JoinMeeting(string meetingCode)
    {
        if (string.IsNullOrWhiteSpace(meetingCode))
        {
            throw new HubException("Invalid meeting code.");
        }

        var meeting = await _meetingRepository.GetByCodeAsync(meetingCode);
        if (meeting == null)
        {
            throw new HubException("Meeting not found.");
        }

        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            var isAuthorized = meeting.HostUserId == userId ||
                               meeting.Participants.Any(p => p.UserId == userId) ||
                               meeting.Scope == Domain.Enums.ConversationScope.InterRegional ||
                               meeting.AllowExternalGuests;

            if (!isAuthorized)
            {
                throw new HubException("Access denied: You are not authorized to join this meeting room.");
            }

            var groupName = $"meet_{meetingCode}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            var meetings = ConnectionMeetings.GetOrAdd(Context.ConnectionId, _ => new ConcurrentDictionary<string, byte>());
            meetings.TryAdd(meetingCode, 0);

            await Clients.OthersInGroup(groupName).OnParticipantJoined(new { connectionId = Context.ConnectionId, userId });
        }
        else
        {
            throw new HubException("User identity not verified.");
        }
    }

    public async Task LeaveMeeting(string meetingCode)
    {
        var groupName = $"meet_{meetingCode}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings))
        {
            meetings.TryRemove(meetingCode, out _);
        }

        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            await Clients.OthersInGroup(groupName).OnParticipantLeft(userId);
        }
    }

    public async Task SendWebRtcSignal(string targetConnectionId, string type, string payload)
    {
        if (type == "offer")
        {
            await Clients.Client(targetConnectionId).ReceiveWebRtcOffer(Context.ConnectionId, payload);
        }
        else if (type == "answer")
        {
            await Clients.Client(targetConnectionId).ReceiveWebRtcAnswer(Context.ConnectionId, payload);
        }
        else if (type == "ice")
        {
            await Clients.Client(targetConnectionId).ReceiveIceCandidate(Context.ConnectionId, payload);
        }
    }

    public async Task SendReaction(string meetingCode, string emoji)
    {
        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings) && meetings.ContainsKey(meetingCode))
        {
            if (Guid.TryParse(Context.UserIdentifier, out var userId))
            {
                await Clients.Group($"meet_{meetingCode}").OnReactionReceived(userId, emoji);
            }
        }
    }

    public async Task BroadcastMeetingChatMessage(string meetingCode, object message)
    {
        if (ConnectionMeetings.TryGetValue(Context.ConnectionId, out var meetings) && meetings.ContainsKey(meetingCode))
        {
            await Clients.Group($"meet_{meetingCode}").ReceiveMeetingChatMessage(message);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (ConnectionMeetings.TryRemove(Context.ConnectionId, out var meetings))
        {
            var hasUserId = Guid.TryParse(Context.UserIdentifier, out var userId);
            foreach (var meetingCode in meetings.Keys)
            {
                var groupName = $"meet_{meetingCode}";
                if (hasUserId)
                {
                    await Clients.OthersInGroup(groupName).OnParticipantLeft(userId);
                }
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
