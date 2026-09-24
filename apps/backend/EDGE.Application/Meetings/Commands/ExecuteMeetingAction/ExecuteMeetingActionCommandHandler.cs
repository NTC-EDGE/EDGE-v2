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
    private readonly IUnitOfWork _unitOfWork;

    public ExecuteMeetingActionCommandHandler(
        IMeetingRepository meetingRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _meetingRepository = meetingRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
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
            throw new UnauthorizedAccessException("You are not a participant in this meeting.");
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
