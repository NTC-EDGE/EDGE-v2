using System;
using MediatR;

namespace EDGE.Application.Conversations.Commands.RemoveParticipant;

public record RemoveConversationParticipantCommand(
    Guid ConversationId,
    Guid UserId
) : IRequest<bool>;
