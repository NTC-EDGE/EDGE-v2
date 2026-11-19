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

        var participant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id && !p.IsDeleted);
        if (participant == null)
        {
            if (meeting.HostUserId == currentUser.Id || currentUser.IsSuperAdmin || meeting.Scope == ConversationScope.InterRegional)
            {
                participant = new MeetingParticipant
                {
                    MeetingId = meeting.Id,
                    UserId = currentUser.Id,
                    TenantId = meeting.TenantId,
                    Role = meeting.HostUserId == currentUser.Id ? ParticipantRole.Owner : ParticipantRole.Member,
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

        int? raisedQueuePos = null;
        Guid? spotlightedTarget = null;

        if (request.ActionType == MeetingActionType.RaiseHand)
        {
            if (!participant.IsHandRaised)
            {
                var count = await _meetingRepository.GetHandRaiseQueueCountAsync(meeting.Id, cancellationToken);
                participant.IsHandRaised = true;
                participant.HandRaiseQueuePosition = count + 1;
                participant.HandRaisedAt = DateTimeOffset.UtcNow;
            }
            raisedQueuePos = participant.HandRaiseQueuePosition ?? 1;
        }
        else if (request.ActionType == MeetingActionType.LowerHand)
        {
            var targetId = (isHostOrAdmin && request.TargetUserId.HasValue) ? request.TargetUserId.Value : currentUser.Id;
            var targetParticipant = meeting.Participants.FirstOrDefault(p => p.UserId == targetId);
            if (targetParticipant != null)
            {
                targetParticipant.IsHandRaised = false;
                targetParticipant.HandRaiseQueuePosition = null;
                targetParticipant.HandRaisedAt = null;
            }

            // Re-index remaining raised hands in chronological order
            var remainingRaised = meeting.Participants
                .Where(p => p.IsHandRaised && p.UserId != targetId)
                .OrderBy(p => p.HandRaisedAt ?? DateTimeOffset.MaxValue)
                .ToList();
            for (var idx = 0; idx < remainingRaised.Count; idx++)
            {
                remainingRaised[idx].HandRaiseQueuePosition = idx + 1;
            }
        }
        else if (request.ActionType == MeetingActionType.MuteParticipant)
        {
            if (!isHostOrAdmin)
            {
                throw new UnauthorizedAccessException("Only the meeting host or administrators can mute participants.");
            }

            if (request.TargetUserId.HasValue && request.TargetUserId.Value != Guid.Empty)
            {
                var target = meeting.Participants.FirstOrDefault(p => p.UserId == request.TargetUserId.Value);
                if (target != null) target.IsMutedByHost = true;
            }
            else
            {
                // Mute All non-caller participants
                foreach (var p in meeting.Participants.Where(p => p.UserId != currentUser.Id))
                {
                    p.IsMutedByHost = true;
                }
            }
        }
        else if (request.ActionType == MeetingActionType.SpotlightParticipant)
        {
            if (!isHostOrAdmin)
            {
                throw new UnauthorizedAccessException("Only the meeting host or administrators can spotlight participants.");
            }

            if (request.TargetUserId.HasValue && request.TargetUserId.Value != Guid.Empty)
            {
                var currentSpotlight = meeting.Participants.FirstOrDefault(p => p.IsSpotlighted);
                var clearSpotlight = currentSpotlight != null && currentSpotlight.UserId == request.TargetUserId.Value;

                foreach (var p in meeting.Participants)
                {
                    p.IsSpotlighted = !clearSpotlight && p.UserId == request.TargetUserId.Value;
                }
                spotlightedTarget = clearSpotlight ? null : request.TargetUserId.Value;
            }
            else
            {
                foreach (var p in meeting.Participants)
                {
                    p.IsSpotlighted = false;
                }
                spotlightedTarget = null;
            }
        }
        else if (request.ActionType == MeetingActionType.KickParticipant && request.TargetUserId.HasValue)
        {
            if (!isHostOrAdmin)
            {
                throw new UnauthorizedAccessException("Only the meeting host or administrators can remove participants.");
            }
            if (request.TargetUserId.Value == meeting.HostUserId)
            {
                throw new InvalidOperationException("The meeting host cannot be removed.");
            }
            var target = meeting.Participants.FirstOrDefault(p => p.UserId == request.TargetUserId.Value);
            if (target != null)
            {
                target.LeftAt = DateTimeOffset.UtcNow;
                target.IsDeleted = true;
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
            participant.IsHandRaised = false;
            participant.HandRaiseQueuePosition = null;
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

        // Dispatch real-time notifications after persistence
        var actorName = $"{currentUser.FirstName} {currentUser.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(actorName)) actorName = "Participant";

        if (request.ActionType == MeetingActionType.RaiseHand && raisedQueuePos.HasValue)
        {
            await _meetingNotificationService.NotifyHandRaisedAsync(meeting.MeetingCode, currentUser.Id, actorName, raisedQueuePos.Value, cancellationToken);
        }
        else if (request.ActionType == MeetingActionType.LowerHand)
        {
            var loweredUserId = (isHostOrAdmin && request.TargetUserId.HasValue) ? request.TargetUserId.Value : currentUser.Id;
            await _meetingNotificationService.NotifyHandLoweredAsync(meeting.MeetingCode, loweredUserId, cancellationToken);
        }
        else if (request.ActionType == MeetingActionType.MuteParticipant)
        {
            await _meetingNotificationService.NotifyParticipantMutedAsync(meeting.MeetingCode, request.TargetUserId, currentUser.Id, cancellationToken);
        }
        else if (request.ActionType == MeetingActionType.SpotlightParticipant)
        {
            await _meetingNotificationService.NotifyParticipantSpotlightedAsync(meeting.MeetingCode, spotlightedTarget, cancellationToken);
        }
        else if (request.ActionType == MeetingActionType.KickParticipant && request.TargetUserId.HasValue)
        {
            await _meetingNotificationService.NotifyParticipantKickedAsync(meeting.MeetingCode, request.TargetUserId.Value, "You were removed from the meeting by the host.", cancellationToken);
        }

        return true;
    }
}
