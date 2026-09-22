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
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public InviteMeetingParticipantsCommandHandler(
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

    public async Task<MeetingDto> Handle(InviteMeetingParticipantsCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException($"Meeting with code '{request.MeetingCode}' was not found.");

        var isHost = meeting.HostUserId == currentUser.Id;
        var callerParticipant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);
        var isAdmin = callerParticipant != null && (callerParticipant.Role == ParticipantRole.Owner || callerParticipant.Role == ParticipantRole.Admin);

        if (!isHost && !isAdmin && !currentUser.IsSuperAdmin)
        {
            throw new UnauthorizedAccessException("Only the meeting host or administrators can invite new participants.");
        }

        var existingUserIds = meeting.Participants.Select(p => p.UserId).ToHashSet();

        foreach (var userId in request.UserIds.Where(id => id != Guid.Empty && !existingUserIds.Contains(id)))
        {
            var pMemberships = await _tenantMemberRepository.GetMembersByUserAsync(userId, cancellationToken);
            var pTenantId = pMemberships.FirstOrDefault()?.TenantId ?? meeting.TenantId;

            meeting.Participants.Add(new MeetingParticipant
            {
                MeetingId = meeting.Id,
                UserId = userId,
                TenantId = pTenantId,
                Role = ParticipantRole.Member
            });
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await _meetingRepository.GetByIdAsync(meeting.Id, cancellationToken);
        return new MeetingDto
        {
            Id = updated!.Id,
            Title = updated.Title,
            Description = updated.Description,
            MeetingCode = updated.MeetingCode,
            Scope = updated.Scope,
            TenantId = updated.TenantId,
            TenantName = updated.Tenant?.Name,
            HostUserId = updated.HostUserId,
            HostUserName = $"{updated.HostUser?.FirstName} {updated.HostUser?.LastName}".Trim(),
            ScheduledStartTime = updated.ScheduledStartTime,
            ScheduledEndTime = updated.ScheduledEndTime,
            Status = updated.Status,
            Participants = updated.Participants.Select(p => new MeetingParticipantDto
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
