using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Conversations.Commands.AddParticipants;

public record AddConversationParticipantsCommand(
    Guid ConversationId,
    List<Guid> UserIds
) : IRequest<ConversationDto>;
