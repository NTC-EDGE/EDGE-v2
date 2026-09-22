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
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMeetingCommandHandler(
        IMeetingRepository meetingRepository,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _meetingRepository = meetingRepository;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<MeetingDto> Handle(CreateMeetingCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var userMemberships = await _tenantMemberRepository.GetMembersByUserAsync(currentUser.Id, cancellationToken);
        var hostTenantId = (request.TenantId.HasValue && request.TenantId != Guid.Empty)
            ? request.TenantId
            : userMemberships.FirstOrDefault()?.TenantId 
              ?? currentUser.TenantMemberships?.FirstOrDefault()?.TenantId;

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
            TenantId = hostTenantId,
            Role = ParticipantRole.Owner
        });

        if (request.ParticipantUserIds != null)
        {
            foreach (var pUserId in request.ParticipantUserIds.Where(id => id != currentUser.Id && id != Guid.Empty))
            {
                var pMemberships = await _tenantMemberRepository.GetMembersByUserAsync(pUserId, cancellationToken);
                var pTenantId = pMemberships.FirstOrDefault()?.TenantId ?? hostTenantId;

                meeting.Participants.Add(new MeetingParticipant
                {
                    UserId = pUserId,
                    TenantId = pTenantId,
                    Role = ParticipantRole.Member
                });
            }
        }

        await _meetingRepository.AddMeetingAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await _meetingRepository.GetByIdAsync(meeting.Id, cancellationToken);
        return new MeetingDto
        {
            Id = created!.Id,
            Title = created.Title,
            Description = created.Description,
            MeetingCode = created.MeetingCode,
            Scope = created.Scope,
            TenantId = created.TenantId,
            TenantName = created.Tenant?.Name,
            HostUserId = created.HostUserId,
            HostUserName = $"{created.HostUser?.FirstName} {created.HostUser?.LastName}".Trim(),
            ScheduledStartTime = created.ScheduledStartTime,
            ScheduledEndTime = created.ScheduledEndTime,
            Status = created.Status,
            Participants = created.Participants.Select(p => new MeetingParticipantDto
            {
                UserId = p.UserId,
                FullName = $"{p.User?.FirstName} {p.User?.LastName}".Trim(),
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
