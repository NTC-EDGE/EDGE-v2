using MediatR;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Conversations.Queries.GetMessages;

public record GetMessagesQuery(
    Guid ConversationId,
    int Skip = 0,
    int Take = 50
) : IRequest<List<ChatMessageDto>>;
