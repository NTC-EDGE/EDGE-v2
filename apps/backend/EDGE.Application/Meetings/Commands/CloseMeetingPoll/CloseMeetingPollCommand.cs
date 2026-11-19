using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.CloseMeetingPoll;

public record CloseMeetingPollCommand(
    string MeetingCode,
    Guid PollId
) : IRequest<MeetingPollDto>;

public class CloseMeetingPollCommandValidator : AbstractValidator<CloseMeetingPollCommand>
{
    public CloseMeetingPollCommandValidator()
    {
        RuleFor(x => x.MeetingCode)
            .NotEmpty().WithMessage("Meeting code is required.");

        RuleFor(x => x.PollId)
            .NotEmpty().WithMessage("Poll ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Valid Poll ID is required.");
    }
}

public class CloseMeetingPollCommandHandler : IRequestHandler<CloseMeetingPollCommand, MeetingPollDto>
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMeetingNotificationService? _meetingNotificationService;

    public CloseMeetingPollCommandHandler(
        IMeetingRepository meetingRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork,
        IMeetingNotificationService? meetingNotificationService = null)
    {
        _meetingRepository = meetingRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
        _meetingNotificationService = meetingNotificationService;
    }

    public async Task<MeetingPollDto> Handle(CloseMeetingPollCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException("Meeting not found.");

        var participant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id && !p.IsDeleted);
        var isHostOrAdmin = meeting.HostUserId == currentUser.Id ||
                            (participant != null && (participant.Role == ParticipantRole.Owner || participant.Role == ParticipantRole.Admin)) ||
                            currentUser.IsSuperAdmin;

        if (!isHostOrAdmin)
        {
            throw new UnauthorizedAccessException("Only the meeting host or administrators can close live polls.");
        }

        var poll = meeting.Polls.FirstOrDefault(p => p.Id == request.PollId)
            ?? await _meetingRepository.GetPollByIdAsync(request.PollId, cancellationToken)
            ?? throw new KeyNotFoundException("Poll not found.");

        if (poll.MeetingId != meeting.Id)
        {
            throw new InvalidOperationException("Poll does not belong to the specified meeting.");
        }

        poll.IsClosed = true;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        List<string> options;
        try
        {
            options = JsonSerializer.Deserialize<List<string>>(poll.OptionsJson, JsonOptions) ?? new List<string>();
        }
        catch
        {
            options = new List<string>();
        }

        if (_meetingNotificationService != null)
        {
            await _meetingNotificationService.NotifyPollClosedAsync(meeting.MeetingCode, poll.Id, cancellationToken);
        }

        return new MeetingPollDto
        {
            Id = poll.Id,
            Question = poll.Question,
            Options = options,
            IsClosed = poll.IsClosed,
            IsAnonymous = poll.IsAnonymous,
            Votes = poll.Votes
                .Where(v => !v.IsDeleted)
                .Select(v => new MeetingPollVoteDto
                {
                    UserId = poll.IsAnonymous ? Guid.Empty : v.UserId,
                    SelectedOptionIndex = v.SelectedOptionIndex
                }).ToList()
        };
    }
}
