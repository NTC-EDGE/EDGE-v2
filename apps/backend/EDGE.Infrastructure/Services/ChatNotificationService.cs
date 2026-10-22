using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.DTOs;
using EDGE.Infrastructure.Hubs;

namespace EDGE.Infrastructure.Services;

public class ChatNotificationService : IChatNotificationService
{
    private readonly IHubContext<ChatHub, IChatClient> _hubContext;

    public ChatNotificationService(IHubContext<ChatHub, IChatClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyMessageSentAsync(ChatMessageDto message, List<Guid> participantUserIds, CancellationToken cancellationToken = default)
    {
        // 1. Broadcast new message to the active conversation room
        await _hubContext.Clients.Group($"conv_{message.ConversationId}").ReceiveMessage(message);

        // 2. Broadcast conversation update (unread count & preview) to all participant user groups
        foreach (var userId in participantUserIds)
        {
            await _hubContext.Clients.Group($"user_{userId}").ConversationUpdated(message.ConversationId);
        }
    }

    public async Task NotifyConversationUpdatedAsync(Guid conversationId, List<Guid> participantUserIds, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.Group($"conv_{conversationId}").ConversationUpdated(conversationId);
        foreach (var userId in participantUserIds)
        {
            await _hubContext.Clients.Group($"user_{userId}").ConversationUpdated(conversationId);
        }
    }
}
