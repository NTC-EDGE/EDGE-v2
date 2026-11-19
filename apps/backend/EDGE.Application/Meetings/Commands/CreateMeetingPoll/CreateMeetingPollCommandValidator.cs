using System.Linq;
using FluentValidation;

namespace EDGE.Application.Meetings.Commands.CreateMeetingPoll;

public class CreateMeetingPollCommandValidator : AbstractValidator<CreateMeetingPollCommand>
{
    public CreateMeetingPollCommandValidator()
    {
        RuleFor(x => x.MeetingCode)
            .NotEmpty().WithMessage("Meeting code is required.");

        RuleFor(x => x.Question)
            .NotEmpty().WithMessage("Poll question is required.")
            .MinimumLength(3).WithMessage("Poll question must be at least 3 characters.")
            .MaximumLength(300).WithMessage("Poll question cannot exceed 300 characters.");

        RuleFor(x => x.Options)
            .NotNull().WithMessage("Poll options are required.")
            .Must(opts => opts != null && opts.Count(o => !string.IsNullOrWhiteSpace(o)) >= 2)
            .WithMessage("At least 2 non-empty poll options are required.")
            .Must(opts => opts == null || opts.Count <= 6)
            .WithMessage("A poll can have at most 6 options.");
    }
}
