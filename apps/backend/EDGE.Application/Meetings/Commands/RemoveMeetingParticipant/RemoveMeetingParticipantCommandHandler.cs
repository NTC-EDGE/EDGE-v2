using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.RemoveMeetingParticipant;

public class RemoveMeetingParticipantCommandHandler : IRequestHandler<RemoveMeetingParticipantCommand, bool>
{
    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveMeetingParticipantCommandHandler(
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

    public async Task<bool> Handle(RemoveMeetingParticipantCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException($"Meeting with code '{request.MeetingCode}' was not found.");

        var isHost = meeting.HostUserId == currentUser.Id;
        var isSelf = currentUser.Id == request.UserId;
        var callerParticipant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);
        var isAdmin = callerParticipant != null && (callerParticipant.Role == ParticipantRole.Owner || callerParticipant.Role == ParticipantRole.Admin);

        if (!isHost && !isSelf && !isAdmin && !currentUser.IsSuperAdmin)
        {
            throw new UnauthorizedAccessException("You do not have permission to remove this participant.");
        }

        if (meeting.HostUserId == request.UserId && !isSelf)
        {
            throw new InvalidOperationException("The meeting host cannot be removed by other participants.");
        }

        var participant = meeting.Participants.FirstOrDefault(p => p.UserId == request.UserId);
        if (participant != null)
        {
            meeting.Participants.Remove(participant);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return true;
        }

        return false;
    }
}
