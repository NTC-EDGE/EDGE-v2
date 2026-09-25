using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Common.Interfaces;

public interface IChatNotificationService
{
    Task NotifyMessageSentAsync(ChatMessageDto message, List<Guid> participantUserIds, CancellationToken cancellationToken = default);
    Task NotifyConversationUpdatedAsync(Guid conversationId, List<Guid> participantUserIds, CancellationToken cancellationToken = default);
}
