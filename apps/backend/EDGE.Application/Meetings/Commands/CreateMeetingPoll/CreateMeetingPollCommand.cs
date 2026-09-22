using MediatR;
using System.Text.Json;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;
using EDGE.Domain.Entities;

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
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateMeetingPollCommandHandler(
        IMeetingRepository meetingRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _meetingRepository = meetingRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<MeetingPollDto> Handle(CreateMeetingPollCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("User not authenticated.");
        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException("Meeting not found.");

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
