namespace EDGE.Infrastructure.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(object message);
    Task MessageEdited(Guid messageId, string newContent);
    Task MessageDeleted(Guid messageId);
    Task UserTyping(Guid conversationId, Guid userId, string userName);
    Task UserStoppedTyping(Guid conversationId, Guid userId);
    Task MessageReadReceiptUpdated(Guid conversationId, Guid messageId, Guid userId);
    Task ConversationUpdated(Guid conversationId);
}
