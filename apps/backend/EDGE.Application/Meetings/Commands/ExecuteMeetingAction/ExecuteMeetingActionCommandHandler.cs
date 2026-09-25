using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.ExecuteMeetingAction;

public class ExecuteMeetingActionCommandHandler : IRequestHandler<ExecuteMeetingActionCommand, bool>
{
    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMeetingNotificationService _meetingNotificationService;
    private readonly IUnitOfWork _unitOfWork;

    public ExecuteMeetingActionCommandHandler(
        IMeetingRepository meetingRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IMeetingNotificationService meetingNotificationService,
        IUnitOfWork unitOfWork)
    {
        _meetingRepository = meetingRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _meetingNotificationService = meetingNotificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(ExecuteMeetingActionCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException("Meeting not found.");

        var participant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);
        if (participant == null)
        {
            if (meeting.HostUserId == currentUser.Id || currentUser.IsSuperAdmin)
            {
                participant = new MeetingParticipant
                {
                    MeetingId = meeting.Id,
                    UserId = currentUser.Id,
                    TenantId = meeting.TenantId,
                    Role = ParticipantRole.Owner,
                    IsDeleted = false
                };
                meeting.Participants.Add(participant);
            }
            else
            {
                throw new UnauthorizedAccessException("You are not a participant in this meeting.");
            }
        }

        var isHostOrAdmin = meeting.HostUserId == currentUser.Id ||
                            participant.Role == ParticipantRole.Owner ||
                            participant.Role == ParticipantRole.Admin ||
                            currentUser.IsSuperAdmin;

        if (request.ActionType == MeetingActionType.RaiseHand)
        {
            var count = await _meetingRepository.GetHandRaiseQueueCountAsync(meeting.Id, cancellationToken);
            participant.IsHandRaised = true;
            participant.HandRaiseQueuePosition = count + 1;
            participant.HandRaisedAt = DateTimeOffset.UtcNow;
        }
        else if (request.ActionType == MeetingActionType.LowerHand)
        {
            participant.IsHandRaised = false;
            participant.HandRaiseQueuePosition = null;
            participant.HandRaisedAt = null;
        }
        else if (request.ActionType == MeetingActionType.MuteParticipant && request.TargetUserId.HasValue)
        {
            if (!isHostOrAdmin)
            {
                throw new UnauthorizedAccessException("Only the meeting host or administrators can mute participants.");
            }
            var target = meeting.Participants.FirstOrDefault(p => p.UserId == request.TargetUserId.Value);
            if (target != null) target.IsMutedByHost = true;
        }
        else if (request.ActionType == MeetingActionType.SpotlightParticipant && request.TargetUserId.HasValue)
        {
            if (!isHostOrAdmin)
            {
                throw new UnauthorizedAccessException("Only the meeting host or administrators can spotlight participants.");
            }
            foreach (var p in meeting.Participants)
            {
                p.IsSpotlighted = p.UserId == request.TargetUserId.Value;
            }
        }
        else if (request.ActionType == MeetingActionType.EndMeeting)
        {
            if (!isHostOrAdmin)
            {
                throw new UnauthorizedAccessException("Only the meeting host or administrators can end the meeting.");
            }
            meeting.Status = MeetingStatus.Ended;
            meeting.ActualEndTime = DateTimeOffset.UtcNow;
            await _meetingNotificationService.NotifyMeetingEndedAsync(meeting.MeetingCode, cancellationToken);
        }
        else if (request.ActionType == MeetingActionType.CancelMeeting)
        {
            if (!isHostOrAdmin)
            {
                throw new UnauthorizedAccessException("Only the meeting host or administrators can delete or cancel the meeting.");
            }
            meeting.Status = MeetingStatus.Cancelled;
            await _meetingNotificationService.NotifyMeetingEndedAsync(meeting.MeetingCode, cancellationToken);
        }
        else if (request.ActionType == MeetingActionType.LeaveMeeting)
        {
            participant.LeftAt = DateTimeOffset.UtcNow;
            // If host leaves without ending for all, assign co-host / admin role to another active participant if available
            if (meeting.HostUserId == currentUser.Id)
            {
                var nextAdmin = meeting.Participants.FirstOrDefault(p => p.UserId != currentUser.Id && !p.IsDeleted && p.LeftAt == null && (p.Role == ParticipantRole.Admin || p.Role == ParticipantRole.Owner));
                if (nextAdmin == null)
                {
                    var nextMember = meeting.Participants.FirstOrDefault(p => p.UserId != currentUser.Id && !p.IsDeleted && p.LeftAt == null);
                    if (nextMember != null)
                    {
                        nextMember.Role = ParticipantRole.Admin;
                        nextAdmin = nextMember;
                    }
                }

                if (nextAdmin != null)
                {
                    var promotedUser = await _userRepository.GetByIdAsync(nextAdmin.UserId, cancellationToken);
                    var newHostName = promotedUser != null ? $"{promotedUser.FirstName} {promotedUser.LastName}".Trim() : "Participant";
                    await _meetingNotificationService.NotifyHostChangedAsync(meeting.MeetingCode, nextAdmin.UserId, newHostName, cancellationToken);
                }
            }
        }

        var action = new MeetingAction
        {
            MeetingId = meeting.Id,
            ActorUserId = currentUser.Id,
            TargetUserId = request.TargetUserId,
            ActionType = request.ActionType,
            ActionPayload = request.ActionPayload
        };

        await _meetingRepository.AddMeetingActionAsync(action, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
