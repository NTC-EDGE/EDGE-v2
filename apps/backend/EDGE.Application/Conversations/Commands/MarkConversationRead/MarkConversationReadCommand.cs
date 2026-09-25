using System;
using MediatR;

namespace EDGE.Application.Conversations.Commands.MarkConversationRead;

public record MarkConversationReadCommand(Guid ConversationId) : IRequest<bool>;
