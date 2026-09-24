using MediatR;
using System.Text.Json;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.CreateMeetingPoll;

public record CreateMeetingPollCommand(
    string MeetingCode,
    string Question,
    List<string> Options,
    bool IsAnonymous = false
) : IRequest<MeetingPollDto>;

public class CreateMeetingPollCommandHandler : IRequestHandler<CreateMeetingPollCommand, MeetingPollDto>
{
    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMeetingPollCommandHandler(
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

    public async Task<MeetingPollDto> Handle(CreateMeetingPollCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException("Meeting not found.");

        var participant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id);
        var isHostOrAdmin = meeting.HostUserId == currentUser.Id ||
                            (participant != null && (participant.Role == ParticipantRole.Owner || participant.Role == ParticipantRole.Admin)) ||
                            currentUser.IsSuperAdmin;

        if (!isHostOrAdmin)
        {
            throw new UnauthorizedAccessException("Only the meeting host or administrators can create live polls.");
        }

        var poll = new MeetingPoll
        {
            MeetingId = meeting.Id,
            Question = request.Question,
            OptionsJson = JsonSerializer.Serialize(request.Options),
            IsAnonymous = request.IsAnonymous
        };

        await _meetingRepository.AddMeetingPollAsync(poll, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MeetingPollDto
        {
            Id = poll.Id,
            Question = poll.Question,
            Options = request.Options,
            IsClosed = poll.IsClosed,
            IsAnonymous = poll.IsAnonymous
        };
    }
}
