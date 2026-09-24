using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Hubs;

[Authorize]
public class ChatHub : Hub<IChatClient>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;

    public ChatHub(IConversationRepository conversationRepository, IUserRepository userRepository)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
    }

    private async Task<Guid?> ResolveUserIdAsync()
    {
        var identifier = Context.UserIdentifier
                      ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? Context.User?.FindFirst("sub")?.Value
                      ?? Context.User?.FindFirst("user_id")?.Value;

        if (!string.IsNullOrWhiteSpace(identifier) && Guid.TryParse(identifier, out var parsedGuid))
        {
            return parsedGuid;
        }

        if (!string.IsNullOrWhiteSpace(identifier))
        {
            var user = await _userRepository.GetByAuthUserIdAsync(identifier);
            if (user != null)
            {
                return user.Id;
            }
        }

        var email = Context.User?.FindFirst(ClaimTypes.Email)?.Value
                 ?? Context.User?.FindFirst("email")?.Value;

        if (!string.IsNullOrWhiteSpace(email))
        {
            var userByEmail = await _userRepository.GetByEmailAsync(email);
            if (userByEmail != null)
            {
                return userByEmail.Id;
            }
        }

        return null;
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
