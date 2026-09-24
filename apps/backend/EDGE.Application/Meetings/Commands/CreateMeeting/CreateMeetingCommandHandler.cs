using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.CreateMeeting;

public class CreateMeetingCommandHandler : IRequestHandler<CreateMeetingCommand, MeetingDto>
{
    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserNotificationRepository _userNotificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMeetingCommandHandler(
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

    public async Task<MeetingDto> Handle(CreateMeetingCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        Guid? fallbackTenantId = allTenants.FirstOrDefault(t => t.IsActive)?.Id 
            ?? allTenants.FirstOrDefault()?.Id;

        var userMemberships = await _tenantMemberRepository.GetMembersByUserAsync(currentUser.Id, cancellationToken);
        var hostTenantId = (request.TenantId.HasValue && request.TenantId != Guid.Empty)
            ? request.TenantId
            : userMemberships.FirstOrDefault()?.TenantId 
              ?? currentUser.TenantMemberships?.FirstOrDefault(tm => tm.TenantId != Guid.Empty)?.TenantId
              ?? fallbackTenantId;

        var meetingCode = $"edg-{Guid.NewGuid().ToString()[..8]}";

        var meeting = new Meeting
        {
            Title = request.Title,
            Description = request.Description,
            MeetingCode = meetingCode,
            Scope = request.Scope,
            TenantId = hostTenantId,
            HostUserId = currentUser.Id,
            ScheduledStartTime = request.ScheduledStartTime,
            ScheduledEndTime = request.ScheduledEndTime,
            Status = MeetingStatus.Scheduled
        };

        meeting.Participants.Add(new MeetingParticipant
        {
            UserId = currentUser.Id,
            TenantId = hostTenantId ?? fallbackTenantId,
            Role = ParticipantRole.Owner,
            IsDeleted = false,
            IsDeletedBy = string.Empty
        });

        if (request.ParticipantUserIds != null)
        {
            foreach (var pUserId in request.ParticipantUserIds.Where(id => id != currentUser.Id && id != Guid.Empty))
            {
                var pUser = await _userRepository.GetByIdAsync(pUserId, cancellationToken);
                if (pUser == null)
                {
                    continue;
                }

                var pMemberships = await _tenantMemberRepository.GetMembersByUserAsync(pUserId, cancellationToken);
                var pTenantId = pMemberships.FirstOrDefault()?.TenantId 
                    ?? pUser.TenantMemberships?.FirstOrDefault(tm => tm.TenantId != Guid.Empty)?.TenantId
                    ?? hostTenantId 
                    ?? fallbackTenantId;

                var participantTenantId = pTenantId.HasValue && pTenantId.Value != Guid.Empty ? pTenantId : fallbackTenantId;

                meeting.Participants.Add(new MeetingParticipant
                {
                    UserId = pUserId,
                    TenantId = participantTenantId,
                    Role = ParticipantRole.Member,
                    IsDeleted = false,
                    IsDeletedBy = string.Empty
                });
            }
        }

        await _meetingRepository.AddMeetingAsync(meeting, cancellationToken);

        var formattedTime = meeting.ScheduledStartTime.ToString("MMM dd, yyyy 'at' hh:mm tt");
        var hostName = $"{currentUser.FirstName} {currentUser.LastName}".Trim();

        var notifications = meeting.Participants
            .Where(p => p.UserId != currentUser.Id)
            .Select(p => new UserNotification
            {
                UserId = p.UserId,
                TenantId = p.TenantId ?? hostTenantId,
                Type = NotificationType.MeetingInvite,
                Title = $"Meeting Scheduled: {meeting.Title}",
                Body = $"You have been invited by {hostName} to join '{meeting.Title}' scheduled on {formattedTime}. Meeting Code: {meeting.MeetingCode}.",
                ActionUrl = $"/meet?code={meeting.MeetingCode}",
                ReferenceId = meeting.MeetingCode,
                IsRead = false
            })
            .ToList();

        if (notifications.Any())
        {
            await _userNotificationRepository.CreateNotificationsAsync(notifications, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _meetingRepository.GetByIdAsync(meeting.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Failed to retrieve meeting with ID {meeting.Id} after creation.");

        return new MeetingDto
        {
            Id = created.Id,
            Title = created.Title,
            Description = created.Description,
            MeetingCode = created.MeetingCode,
            Scope = created.Scope,
            TenantId = created.TenantId,
            TenantName = created.Tenant?.Name,
            HostUserId = created.HostUserId,
            HostUserName = created.HostUser != null
                ? $"{created.HostUser.FirstName} {created.HostUser.LastName}".Trim()
                : hostName,
            ScheduledStartTime = created.ScheduledStartTime,
            ScheduledEndTime = created.ScheduledEndTime,
            Status = created.Status,
            Participants = created.Participants.Select(p => new MeetingParticipantDto
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
