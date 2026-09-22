using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Conversations.Commands.CreateConversation;

public class CreateConversationCommandHandler : IRequestHandler<CreateConversationCommand, ConversationDto>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateConversationCommandHandler(
        IConversationRepository conversationRepository,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantRepository = tenantRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ConversationDto> Handle(CreateConversationCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        Guid? fallbackTenantId = allTenants.FirstOrDefault(t => t.IsActive)?.Id 
            ?? allTenants.FirstOrDefault()?.Id;

        var userMemberships = await _tenantMemberRepository.GetMembersByUserAsync(currentUser.Id, cancellationToken);
        var defaultTenantId = (request.TenantId.HasValue && request.TenantId != Guid.Empty)
            ? request.TenantId
            : userMemberships.FirstOrDefault()?.TenantId 
              ?? currentUser.TenantMemberships?.FirstOrDefault(tm => tm.TenantId != Guid.Empty)?.TenantId
              ?? fallbackTenantId;

        var allUserIds = new HashSet<Guid>(request.ParticipantUserIds.Where(id => id != Guid.Empty)) { currentUser.Id };
        var conversation = new Conversation
        {
            Title = request.Title,
            Description = request.Description,
            Type = request.Type,
            Scope = request.Scope,
            TenantId = defaultTenantId
        };

        foreach (var userId in allUserIds)
        {
            var pUser = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (pUser == null && userId != currentUser.Id)
            {
                continue;
            }

            var memberships = await _tenantMemberRepository.GetMembersByUserAsync(userId, cancellationToken);
            var memberTenantId = memberships.FirstOrDefault()?.TenantId 
                ?? pUser?.TenantMemberships?.FirstOrDefault(tm => tm.TenantId != Guid.Empty)?.TenantId
                ?? defaultTenantId 
                ?? fallbackTenantId;

            var participantTenantId = memberTenantId.HasValue && memberTenantId.Value != Guid.Empty ? memberTenantId : fallbackTenantId;

            conversation.Participants.Add(new ConversationParticipant
            {
                UserId = userId,
                TenantId = participantTenantId,
                Role = userId == currentUser.Id ? ParticipantRole.Owner : ParticipantRole.Member,
                IsDeleted = false,
                IsDeletedBy = string.Empty
            });
        }

        await _conversationRepository.AddConversationAsync(conversation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _conversationRepository.GetByIdAsync(conversation.Id, cancellationToken);
        return new ConversationDto
        {
            Id = created!.Id,
            Title = created.Title,
            Description = created.Description,
            Type = created.Type,
            Scope = created.Scope,
            TenantId = created.TenantId,
            TenantName = created.Tenant?.Name,
            LastMessageAt = created.LastMessageAt,
            LastMessagePreview = created.LastMessagePreview,
            Participants = created.Participants.Select(p => new ConversationParticipantDto
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
    }
}
