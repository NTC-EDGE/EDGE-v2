using System;
using MediatR;

namespace EDGE.Application.Conversations.Commands.ToggleArchiveConversation;

public record ToggleArchiveConversationCommand(Guid ConversationId, bool? IsArchived = null) : IRequest<bool>;
