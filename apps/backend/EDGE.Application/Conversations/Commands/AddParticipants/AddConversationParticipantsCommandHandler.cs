using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Conversations.Commands.AddParticipants;

public class AddConversationParticipantsCommandHandler : IRequestHandler<AddConversationParticipantsCommand, ConversationDto>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public AddConversationParticipantsCommandHandler(
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

    public async Task<ConversationDto> Handle(AddConversationParticipantsCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken)
            ?? throw new KeyNotFoundException($"Conversation with ID '{request.ConversationId}' was not found.");

        var callerParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUser.Id && !p.HasLeft);
        if (callerParticipant == null && !currentUser.IsSuperAdmin)
        {
            throw new UnauthorizedAccessException("You are not an active member of this conversation.");
        }

        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        var fallbackTenantId = allTenants.FirstOrDefault(t => t.IsActive)?.Id ?? allTenants.FirstOrDefault()?.Id ?? Guid.Empty;

        if (!conversation.TenantId.HasValue || conversation.TenantId.Value == Guid.Empty)
        {
            conversation.TenantId = fallbackTenantId != Guid.Empty ? fallbackTenantId : null;
        }

        var allParticipants = await _conversationRepository.GetAllParticipantsAsync(conversation.Id, cancellationToken);
        var activeUserIds = allParticipants.Where(p => !p.HasLeft && !p.IsDeleted).Select(p => p.UserId).ToHashSet();

        foreach (var userId in request.UserIds.Where(id => id != Guid.Empty && !activeUserIds.Contains(id)))
        {
            var pUser = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (pUser == null)
            {
                continue;
            }

            var pMemberships = await _tenantMemberRepository.GetMembersByUserAsync(userId, cancellationToken);
            var pTenantId = pMemberships.FirstOrDefault()?.TenantId 
                ?? pUser.TenantMemberships?.FirstOrDefault()?.TenantId
                ?? conversation.TenantId
                ?? fallbackTenantId;

            var effectiveTenantId = pTenantId != Guid.Empty ? pTenantId : fallbackTenantId;

            var existingLeft = allParticipants.FirstOrDefault(p => p.UserId == userId);
            if (existingLeft != null)
            {
                existingLeft.HasLeft = false;
                existingLeft.LeftAt = null;
                existingLeft.IsDeleted = false;
                existingLeft.IsDeletedBy = string.Empty;
                existingLeft.TenantId = effectiveTenantId;
            }
            else
            {
                conversation.Participants.Add(new ConversationParticipant
                {
                    ConversationId = conversation.Id,
                    UserId = userId,
                    TenantId = effectiveTenantId,
                    Role = ParticipantRole.Member,
                    IsDeleted = false,
                    IsDeletedBy = string.Empty
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _conversationRepository.GetByIdAsync(conversation.Id, cancellationToken);
        return new ConversationDto
        {
            Id = updated!.Id,
            Title = updated.Title,
            Description = updated.Description,
            Type = updated.Type,
            Scope = updated.Scope,
            TenantId = updated.TenantId,
            TenantName = updated.Tenant?.Name,
            LastMessageAt = updated.LastMessageAt,
            LastMessagePreview = updated.LastMessagePreview,
            Participants = updated.Participants.Where(p => !p.HasLeft).Select(p => new ConversationParticipantDto
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
