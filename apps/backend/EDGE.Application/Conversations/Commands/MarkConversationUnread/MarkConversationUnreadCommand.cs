using System;
using MediatR;

namespace EDGE.Application.Conversations.Commands.MarkConversationUnread;

public record MarkConversationUnreadCommand(Guid ConversationId) : IRequest<bool>;
