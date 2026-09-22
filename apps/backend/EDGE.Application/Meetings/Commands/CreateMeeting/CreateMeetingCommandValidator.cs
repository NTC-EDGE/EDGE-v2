using FluentValidation;

namespace EDGE.Application.Meetings.Commands.CreateMeeting;

public class CreateMeetingCommandValidator : AbstractValidator<CreateMeetingCommand>
{
    public CreateMeetingCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Meeting title is required.")
            .MaximumLength(200).WithMessage("Meeting title cannot exceed 200 characters.");

        RuleFor(x => x.ScheduledStartTime)
            .NotEmpty().WithMessage("Scheduled start time is required.");
    }
}
