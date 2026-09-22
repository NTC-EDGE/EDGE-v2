using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Hubs;

[Authorize]
public class ChatHub : Hub<IChatClient>
{
    private readonly IConversationRepository _conversationRepository;

    public ChatHub(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task JoinConversation(string conversationId)
    {
        if (Guid.TryParse(conversationId, out var convId) && Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            var conversation = await _conversationRepository.GetByIdAsync(convId);
            if (conversation != null && conversation.Participants.Any(p => p.UserId == userId && !p.HasLeft))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
                return;
            }
        }
        throw new HubException("Access denied: You are not an active participant in this conversation.");
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
    }

    public async Task SendTyping(string conversationId, string userName)
    {
        if (Guid.TryParse(conversationId, out var convId) && Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            var conversation = await _conversationRepository.GetByIdAsync(convId);
            if (conversation != null && conversation.Participants.Any(p => p.UserId == userId && !p.HasLeft))
            {
                await Clients.OthersInGroup($"conv_{conversationId}").UserTyping(convId, userId, userName);
            }
        }
    }

    public async Task StopTyping(string conversationId)
    {
        if (Guid.TryParse(conversationId, out var convId) && Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            var conversation = await _conversationRepository.GetByIdAsync(convId);
            if (conversation != null && conversation.Participants.Any(p => p.UserId == userId && !p.HasLeft))
            {
                await Clients.OthersInGroup($"conv_{conversationId}").UserStoppedTyping(convId, userId);
            }
        }
    }
}
