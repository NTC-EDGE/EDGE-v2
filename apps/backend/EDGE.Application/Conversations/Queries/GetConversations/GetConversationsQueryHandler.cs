using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.DTOs;

namespace EDGE.Application.Conversations.Queries.GetConversations;

public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, List<ConversationDto>>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetConversationsQueryHandler(
        IConversationRepository conversationRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<ConversationDto>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var conversations = await _conversationRepository.GetUserConversationsAsync(currentUser.Id, request.TenantId, cancellationToken);

        return conversations.Select(c =>
        {
            var otherParticipant = c.Participants.FirstOrDefault(p => p.UserId != currentUser.Id && !p.IsDeleted);
            var otherUserName = otherParticipant?.User != null 
                ? $"{otherParticipant.User.FirstName} {otherParticipant.User.LastName}".Trim() 
                : null;

            var resolvedTitle = c.Type == Domain.Enums.ConversationType.Direct && !string.IsNullOrWhiteSpace(otherUserName)
                ? otherUserName
                : c.Title;

            var resolvedAvatar = c.Type == Domain.Enums.ConversationType.Direct && otherParticipant?.User?.ProfilePicture != null
                ? otherParticipant.User.ProfilePicture
                : c.AvatarUrl;

            var userParticipant = c.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);
            var lastRead = userParticipant?.LastReadAt;
            var unreadCount = c.Messages != null
                ? c.Messages.Count(m => !m.IsDeleted && m.SenderId != currentUser.Id && (lastRead == null || m.CreatedAt > lastRead))
                : 0;

            return new ConversationDto
            {
                Id = c.Id,
                Title = resolvedTitle,
                Description = c.Description,
                AvatarUrl = resolvedAvatar,
                Type = c.Type,
                Scope = c.Scope,
                TenantId = c.TenantId,
                TenantName = c.Tenant?.Name,
                LastMessageAt = c.LastMessageAt,
                LastMessagePreview = c.LastMessagePreview,
                UnreadCount = unreadCount,
                Participants = c.Participants.Select(p => new ConversationParticipantDto
                {
                    UserId = p.UserId,
                    FullName = $"{p.User?.FirstName} {p.User?.LastName}".Trim(),
                    Email = p.User?.Email ?? string.Empty,
                    AvatarUrl = p.User?.ProfilePicture,
                    TenantId = p.TenantId,
                    TenantName = p.Tenant?.Name ?? string.Empty,
                    Role = p.Role,
                    IsMuted = p.IsMuted,
                    LastReadAt = p.LastReadAt
                }).ToList()
            };
        }).ToList();
    }
}
