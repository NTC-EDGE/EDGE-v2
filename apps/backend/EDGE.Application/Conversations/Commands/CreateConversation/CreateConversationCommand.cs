using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Conversations.Commands.CreateConversation;

public record CreateConversationCommand(
    string? Title,
    string? Description,
    ConversationType Type,
    ConversationScope Scope,
    Guid? TenantId,
    List<Guid> ParticipantUserIds
) : IRequest<ConversationDto>;
