using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace EDGE.Infrastructure.Hubs;

[Authorize]
public class ChatHub : Hub<IChatClient>
{
    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
    }

    public async Task SendTyping(string conversationId, string userName)
    {
        var userIdStr = Context.UserIdentifier;
        if (Guid.TryParse(userIdStr, out var userId))
        {
            await Clients.OthersInGroup($"conv_{conversationId}").UserTyping(Guid.Parse(conversationId), userId, userName);
        }
    }

    public async Task StopTyping(string conversationId)
    {
        var userIdStr = Context.UserIdentifier;
        if (Guid.TryParse(userIdStr, out var userId))
        {
            await Clients.OthersInGroup($"conv_{conversationId}").UserStoppedTyping(Guid.Parse(conversationId), userId);
        }
    }
}
