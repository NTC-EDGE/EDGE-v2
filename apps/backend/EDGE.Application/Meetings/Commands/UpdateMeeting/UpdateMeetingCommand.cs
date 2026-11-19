using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.DTOs;
using EDGE.Domain.Enums;

namespace EDGE.Application.Meetings.Commands.UpdateMeeting;

public record UpdateMeetingCommand(
    string MeetingCode,
    string Title,
    string? Description,
    ConversationScope Scope,
    DateTimeOffset ScheduledStartTime,
    DateTimeOffset? ScheduledEndTime
) : IRequest<MeetingDto>;

public class UpdateMeetingCommandValidator : AbstractValidator<UpdateMeetingCommand>
{
    public UpdateMeetingCommandValidator()
    {
        RuleFor(x => x.MeetingCode)
            .NotEmpty().WithMessage("Meeting code is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Meeting title is required.")
            .MaximumLength(200).WithMessage("Meeting title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.ScheduledStartTime)
            .NotEmpty().WithMessage("Scheduled start time is required.");

        RuleFor(x => x)
            .Must(x => !x.ScheduledEndTime.HasValue || x.ScheduledEndTime.Value > x.ScheduledStartTime)
            .WithMessage("Scheduled end time must be after scheduled start time.");
    }
}

public class UpdateMeetingCommandHandler : IRequestHandler<UpdateMeetingCommand, MeetingDto>
{
    private readonly IMeetingRepository _meetingRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMeetingCommandHandler(
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

    public async Task<MeetingDto> Handle(UpdateMeetingCommand request, CancellationToken cancellationToken)
    {
        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken)
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var meeting = await _meetingRepository.GetByCodeAsync(request.MeetingCode, cancellationToken)
            ?? throw new KeyNotFoundException($"Meeting with code '{request.MeetingCode}' was not found.");

        var participant = meeting.Participants.FirstOrDefault(p => p.UserId == currentUser.Id && !p.IsDeleted);
        var isHostOrAdmin = meeting.HostUserId == currentUser.Id ||
                            (participant != null && (participant.Role == ParticipantRole.Owner || participant.Role == ParticipantRole.Admin)) ||
                            currentUser.IsSuperAdmin;

        if (!isHostOrAdmin)
        {
            throw new UnauthorizedAccessException("Only the meeting host or administrators can update meeting details.");
        }

        if (meeting.Status == MeetingStatus.Ended || meeting.Status == MeetingStatus.Cancelled)
        {
            throw new InvalidOperationException("Cannot update a meeting that has already ended or been cancelled.");
        }

        meeting.Title = request.Title.Trim();
        meeting.Description = request.Description?.Trim();
        meeting.Scope = request.Scope;
        meeting.ScheduledStartTime = request.ScheduledStartTime;
        meeting.ScheduledEndTime = request.ScheduledEndTime;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MeetingDto
        {
            Id = meeting.Id,
            Title = meeting.Title,
            Description = meeting.Description,
            MeetingCode = meeting.MeetingCode,
            Scope = meeting.Scope,
            TenantId = meeting.TenantId,
            TenantName = meeting.Tenant?.Name,
            HostUserId = meeting.HostUserId,
            HostUserName = meeting.HostUser != null
                ? $"{meeting.HostUser.FirstName} {meeting.HostUser.LastName}".Trim()
                : $"{currentUser.FirstName} {currentUser.LastName}".Trim(),
            LinkedConversationId = meeting.LinkedConversationId,
            ScheduledStartTime = meeting.ScheduledStartTime,
            ScheduledEndTime = meeting.ScheduledEndTime,
            ActualStartTime = meeting.ActualStartTime,
            ActualEndTime = meeting.ActualEndTime,
            Status = meeting.Status,
            Participants = meeting.Participants.Select(p => new MeetingParticipantDto
            {
                UserId = p.UserId,
                FullName = p.User != null ? $"{p.User.FirstName} {p.User.LastName}".Trim() : string.Empty,
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
