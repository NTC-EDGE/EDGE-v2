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
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.VoteMeetingPoll;

public record VoteMeetingPollCommand(
    string MeetingCode,
    Guid PollId,
    int SelectedOptionIndex
) : IRequest<MeetingPollDto>;

public class VoteMeetingPollCommandValidator : AbstractValidator<VoteMeetingPollCommand>
{
    public VoteMeetingPollCommandValidator()
    {
        RuleFor(x => x.MeetingCode)
            .NotEmpty().WithMessage("Meeting code is required.");

        RuleFor(x => x.PollId)
            .NotEmpty().WithMessage("Poll ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Valid Poll ID is required.");

        RuleFor(x => x.SelectedOptionIndex)
            .GreaterThanOrEqualTo(0).WithMessage("Selected option index must be non-negative.");
    }
}

public class VoteMeetingPollCommandHandler : IRequestHandler<VoteMeetingPollCommand, MeetingPollDto>
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMeetingNotificationService? _meetingNotificationService;

    public VoteMeetingPollCommandHandler(
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

    public async Task<MeetingPollDto> Handle(VoteMeetingPollCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException("Meeting not found.");

        var isAuthorized = meeting.Scope == ConversationScope.InterRegional ||
                           meeting.AllowExternalGuests ||
                           meeting.HostUserId == currentUser.Id ||
                           currentUser.IsSuperAdmin ||
                           meeting.Participants.Any(p => p.UserId == currentUser.Id && !p.IsDeleted);

        if (!isAuthorized)
        {
            throw new UnauthorizedAccessException("You are not authorized to vote in this meeting poll.");
        }

        var poll = meeting.Polls.FirstOrDefault(p => p.Id == request.PollId)
            ?? await _meetingRepository.GetPollByIdAsync(request.PollId, cancellationToken)
            ?? throw new KeyNotFoundException("Poll not found.");

        if (poll.MeetingId != meeting.Id)
        {
            throw new InvalidOperationException("Poll does not belong to the specified meeting.");
        }

        if (poll.IsClosed)
        {
            throw new InvalidOperationException("This poll is already closed.");
        }

        List<string> options;
        try
        {
            options = JsonSerializer.Deserialize<List<string>>(poll.OptionsJson, JsonOptions) ?? new List<string>();
        }
        catch
        {
            options = new List<string>();
        }

        if (request.SelectedOptionIndex < 0 || request.SelectedOptionIndex >= options.Count)
        {
            throw new InvalidOperationException("Selected option index is out of range.");
        }

        var existingVote = poll.Votes.FirstOrDefault(v => v.UserId == currentUser.Id && !v.IsDeleted);
        if (existingVote != null)
        {
            existingVote.SelectedOptionIndex = request.SelectedOptionIndex;
        }
        else
        {
            var newVote = new MeetingPollVote
            {
                MeetingPollId = poll.Id,
                UserId = currentUser.Id,
                SelectedOptionIndex = request.SelectedOptionIndex
            };
            poll.Votes.Add(newVote);
            await _meetingRepository.AddMeetingPollVoteAsync(newVote, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new MeetingPollDto
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

        if (_meetingNotificationService != null)
        {
            await _meetingNotificationService.NotifyPollUpdatedAsync(meeting.MeetingCode, dto, cancellationToken);
        }

        return dto;
    }
}
