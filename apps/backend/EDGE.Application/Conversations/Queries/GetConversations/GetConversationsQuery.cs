using MediatR;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Conversations.Queries.GetConversations;

public record GetConversationsQuery(Guid? TenantId = null) : IRequest<List<ConversationDto>>;
