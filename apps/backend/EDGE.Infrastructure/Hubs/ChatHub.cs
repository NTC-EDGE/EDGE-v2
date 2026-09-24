using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Hubs;

[Authorize]
public class ChatHub : AuthenticatedHub<IChatClient>
{
    private readonly IConversationRepository _conversationRepository;

    public ChatHub(IConversationRepository conversationRepository, IUserRepository userRepository)
        : base(userRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task JoinConversation(string conversationId)
    {
        if (Guid.TryParse(conversationId, out var convId))
        {
            var resolvedUserId = await ResolveUserIdAsync();
            var conversation = await _conversationRepository.GetByIdAsync(convId);
            if (conversation != null)
            {
                if (resolvedUserId.HasValue && conversation.Participants.Any(p => p.UserId == resolvedUserId.Value && !p.HasLeft))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
                    return;
                }
                if (conversation.Scope == Domain.Enums.ConversationScope.InterRegional)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
                    return;
                }
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
        if (Guid.TryParse(conversationId, out var convId))
        {
            var resolvedUserId = await ResolveUserIdAsync();
            var conversation = await _conversationRepository.GetByIdAsync(convId);
            if (conversation != null && resolvedUserId.HasValue && conversation.Participants.Any(p => p.UserId == resolvedUserId.Value && !p.HasLeft))
            {
                await Clients.OthersInGroup($"conv_{conversationId}").UserTyping(convId, resolvedUserId.Value, userName);
            }
        }
    }

    public async Task StopTyping(string conversationId)
    {
        if (Guid.TryParse(conversationId, out var convId))
        {
            var resolvedUserId = await ResolveUserIdAsync();
            var conversation = await _conversationRepository.GetByIdAsync(convId);
            if (conversation != null && resolvedUserId.HasValue && conversation.Participants.Any(p => p.UserId == resolvedUserId.Value && !p.HasLeft))
            {
                await Clients.OthersInGroup($"conv_{conversationId}").UserStoppedTyping(convId, resolvedUserId.Value);
            }
        }
    }
}
