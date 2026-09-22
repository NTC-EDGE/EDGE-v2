using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Conversation>> GetUserConversationsAsync(Guid userId, Guid? tenantId, CancellationToken cancellationToken = default);
    Task<List<ChatMessage>> GetMessagesAsync(Guid conversationId, int skip, int take, CancellationToken cancellationToken = default);
    Task<Conversation> AddConversationAsync(Conversation conversation, CancellationToken cancellationToken = default);
    Task<ChatMessage> AddMessageAsync(ChatMessage message, CancellationToken cancellationToken = default);
    Task MarkMessagesReadAsync(Guid conversationId, Guid userId, Guid lastMessageId, CancellationToken cancellationToken = default);
    Task<List<ConversationParticipant>> GetAllParticipantsAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
