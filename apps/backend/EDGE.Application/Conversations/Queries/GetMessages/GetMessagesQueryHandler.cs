using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Conversations.Queries.GetMessages;

public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, List<ChatMessageDto>>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMessagesQueryHandler(
        IConversationRepository conversationRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<ChatMessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken)
            ?? throw new KeyNotFoundException("Conversation not found.");

        if (!conversation.Participants.Any(p => p.UserId == currentUser.Id && !p.HasLeft))
        {
            throw new UnauthorizedAccessException("You are not a participant in this conversation.");
        }

        var messages = await _conversationRepository.GetMessagesAsync(request.ConversationId, request.Skip, request.Take, cancellationToken);

        return messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            ConversationId = m.ConversationId,
            SenderId = m.SenderId,
            SenderName = $"{m.Sender?.FirstName} {m.Sender?.LastName}".Trim(),
            SenderAvatarUrl = m.Sender?.ProfilePicture,
            SenderTenantId = m.SenderTenantId,
            SenderTenantName = m.SenderTenant?.Name ?? string.Empty,
            Content = m.Content,
            Type = m.Type,
            ReplyToMessageId = m.ReplyToMessageId,
            CreatedAt = m.CreatedAt,
            Attachments = m.Attachments.Select(a => new MessageAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FileExtension = a.FileExtension,
                MimeType = a.MimeType,
                FileSizeBytes = a.FileSizeBytes,
                StoragePath = a.StoragePath
            }).ToList()
        }).ToList();
    }
}
