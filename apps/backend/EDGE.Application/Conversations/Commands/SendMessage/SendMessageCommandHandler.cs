using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Conversations.Commands.SendMessage;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, ChatMessageDto>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IChatNotificationService _chatNotificationService;
    private readonly IUnitOfWork _unitOfWork;

    public SendMessageCommandHandler(
        IConversationRepository conversationRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IChatNotificationService chatNotificationService,
        IUnitOfWork unitOfWork)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _chatNotificationService = chatNotificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ChatMessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken)
            ?? throw new KeyNotFoundException("Conversation not found.");

        var participant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id && !p.HasLeft);
        if (participant == null)
        {
            var isCreator = conversation.CreatedBy == currentUser.Id.ToString();
            if (isCreator || currentUser.IsSuperAdmin)
            {
                participant = new ConversationParticipant
                {
                    ConversationId = conversation.Id,
                    UserId = currentUser.Id,
                    TenantId = conversation.TenantId,
                    Role = ParticipantRole.Owner,
                    IsDeleted = false
                };
                conversation.Participants.Add(participant);
            }
            else
            {
                throw new UnauthorizedAccessException("You are not a participant in this conversation.");
            }
        }

        var message = new ChatMessage
        {
            ConversationId = request.ConversationId,
            SenderId = currentUser.Id,
            SenderTenantId = participant.TenantId,
            Content = request.Content,
            Type = request.Type,
            ReplyToMessageId = request.ReplyToMessageId
        };

        if (request.Attachments != null && request.Attachments.Count > 0)
        {
            foreach (var att in request.Attachments)
            {
                message.Attachments.Add(new MessageAttachment
                {
                    FileName = att.FileName,
                    FileExtension = att.FileExtension,
                    MimeType = att.MimeType,
                    FileSizeBytes = att.FileSizeBytes,
                    StoragePath = att.StoragePath
                });
            }
        }

        conversation.LastMessageAt = DateTimeOffset.UtcNow;
        conversation.LastMessagePreview = string.IsNullOrWhiteSpace(request.Content) ? "[Attachment]" : request.Content;

        await _conversationRepository.AddMessageAsync(message, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ChatMessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SenderName = $"{currentUser.FirstName} {currentUser.LastName}".Trim(),
            SenderAvatarUrl = currentUser.ProfilePicture,
            SenderTenantId = message.SenderTenantId,
            Content = message.Content,
            Type = message.Type,
            ReplyToMessageId = message.ReplyToMessageId,
            CreatedAt = message.CreatedAt,
            Attachments = message.Attachments.Select(a => new MessageAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FileExtension = a.FileExtension,
                MimeType = a.MimeType,
                FileSizeBytes = a.FileSizeBytes,
                StoragePath = a.StoragePath
            }).ToList()
        };

        var participantUserIds = conversation.Participants.Where(p => !p.HasLeft).Select(p => p.UserId).ToList();
        await _chatNotificationService.NotifyMessageSentAsync(dto, participantUserIds, cancellationToken);

        return dto;
    }
}
