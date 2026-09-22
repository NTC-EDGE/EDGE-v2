using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace EDGE.Infrastructure.Hubs;

[Authorize]
public class MeetingHub : Hub<IMeetingClient>
{
    public async Task JoinMeeting(string meetingCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"meet_{meetingCode}");
    }

    public async Task LeaveMeeting(string meetingCode)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"meet_{meetingCode}");
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
        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            await Clients.Group($"meet_{meetingCode}").OnReactionReceived(userId, emoji);
        }
    }

    public async Task BroadcastMeetingChatMessage(string meetingCode, object message)
    {
        await Clients.Group($"meet_{meetingCode}").ReceiveMeetingChatMessage(message);
    }
}
