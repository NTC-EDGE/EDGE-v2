using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Conversations.Commands.SendMessage;

public record SendMessageCommand(
    Guid ConversationId,
    string Content,
    MessageType Type = MessageType.Text,
    Guid? ReplyToMessageId = null,
    List<MessageAttachmentDto>? Attachments = null
) : IRequest<ChatMessageDto>;
