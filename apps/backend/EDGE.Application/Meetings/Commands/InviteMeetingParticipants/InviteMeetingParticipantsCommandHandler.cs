using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.InviteMeetingParticipants;

public class InviteMeetingParticipantsCommandHandler : IRequestHandler<InviteMeetingParticipantsCommand, MeetingDto>
{
    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserNotificationRepository _userNotificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InviteMeetingParticipantsCommandHandler(
        IMeetingRepository meetingRepository,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        ICurrentUserService currentUserService,
        IUserNotificationRepository userNotificationRepository,
        IUnitOfWork unitOfWork)
    {
        _meetingRepository = meetingRepository;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantRepository = tenantRepository;
        _currentUserService = currentUserService;
        _userNotificationRepository = userNotificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MeetingDto> Handle(InviteMeetingParticipantsCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var hostName = $"{currentUser.FirstName} {currentUser.LastName}".Trim();

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException($"Meeting with code '{request.MeetingCode}' was not found.");

        var isHost = meeting.HostUserId == currentUser.Id;
        var callerParticipant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);
        var isAdmin = callerParticipant != null && (callerParticipant.Role == ParticipantRole.Owner || callerParticipant.Role == ParticipantRole.Admin);

        if (!isHost && !isAdmin && !currentUser.IsSuperAdmin)
        {
            throw new UnauthorizedAccessException("Only the meeting host or administrators can invite new participants.");
        }

        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        Guid? fallbackTenantId = allTenants.FirstOrDefault(t => t.IsActive)?.Id 
            ?? allTenants.FirstOrDefault()?.Id;

        if (!meeting.TenantId.HasValue || meeting.TenantId.Value == Guid.Empty)
        {
            meeting.TenantId = fallbackTenantId;
        }

        var allParticipants = await _meetingRepository.GetAllParticipantsAsync(meeting.Id, cancellationToken);
        var activeUserIds = allParticipants.Where(p => !p.IsDeleted).Select(p => p.UserId).ToHashSet();
        var newlyInvitedUserIds = new List<(Guid UserId, Guid? TenantId)>();

        foreach (var userId in request.UserIds.Where(id => id != Guid.Empty && !activeUserIds.Contains(id)))
        {
            var pUser = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (pUser == null)
            {
                continue;
            }

            var pMemberships = await _tenantMemberRepository.GetMembersByUserAsync(userId, cancellationToken);
            var pTenantId = pMemberships.FirstOrDefault()?.TenantId 
                ?? pUser.TenantMemberships?.FirstOrDefault(tm => tm.TenantId != Guid.Empty)?.TenantId
                ?? meeting.TenantId 
                ?? fallbackTenantId;

            var participantTenantId = pTenantId.HasValue && pTenantId.Value != Guid.Empty ? pTenantId : fallbackTenantId;

            var existingParticipant = allParticipants.FirstOrDefault(p => p.UserId == userId);
            if (existingParticipant != null)
            {
                existingParticipant.IsDeleted = false;
                existingParticipant.IsDeletedBy = string.Empty;
                existingParticipant.TenantId = participantTenantId;
                existingParticipant.Role = ParticipantRole.Member;
                existingParticipant.JoinedAt = null;
                existingParticipant.LeftAt = null;
            }
            else
            {
                meeting.Participants.Add(new MeetingParticipant
                {
                    MeetingId = meeting.Id,
                    UserId = userId,
                    TenantId = participantTenantId,
                    Role = ParticipantRole.Member,
                    IsDeleted = false,
                    IsDeletedBy = string.Empty
                });
            }

            newlyInvitedUserIds.Add((userId, participantTenantId));
        }

        if (newlyInvitedUserIds.Any())
        {
            var formattedTime = meeting.ScheduledStartTime.ToString("MMM dd, yyyy 'at' hh:mm tt");

            var notifications = newlyInvitedUserIds.Select(item => new UserNotification
            {
                UserId = item.UserId,
                TenantId = item.TenantId ?? meeting.TenantId ?? fallbackTenantId,
                Type = NotificationType.MeetingInvite,
                Title = $"Meeting Invitation: {meeting.Title}",
                Body = $"You have been invited by {hostName} to join '{meeting.Title}' scheduled on {formattedTime}. Meeting Code: {meeting.MeetingCode}.",
                ActionUrl = $"/meet?code={meeting.MeetingCode}",
                ReferenceId = meeting.MeetingCode,
                IsRead = false
            }).ToList();

            await _userNotificationRepository.CreateNotificationsAsync(notifications, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _meetingRepository.GetByIdAsync(meeting.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Failed to retrieve meeting with ID {meeting.Id} after inviting participants.");

        return new MeetingDto
        {
            Id = updated.Id,
            Title = updated.Title,
            Description = updated.Description,
            MeetingCode = updated.MeetingCode,
            Scope = updated.Scope,
            TenantId = updated.TenantId,
            TenantName = updated.Tenant?.Name,
            HostUserId = updated.HostUserId,
            HostUserName = updated.HostUser != null
                ? $"{updated.HostUser.FirstName} {updated.HostUser.LastName}".Trim()
                : hostName,
            ScheduledStartTime = updated.ScheduledStartTime,
            ScheduledEndTime = updated.ScheduledEndTime,
            Status = updated.Status,
            Participants = updated.Participants.Select(p => new MeetingParticipantDto
            {
                UserId = p.UserId,
                FullName = p.User != null ? $"{p.User.FirstName} {p.User.LastName}".Trim() : string.Empty,
                Email = p.User?.Email ?? string.Empty,
                AvatarUrl = p.User?.ProfilePicture,
                Role = p.Role,
                IsHandRaised = p.IsHandRaised,
                HandRaiseQueuePosition = p.HandRaiseQueuePosition,
                IsMutedByHost = p.IsMutedByHost,
                IsSpotlighted = p.IsSpotlighted
            }).ToList()
        };
    }
}
