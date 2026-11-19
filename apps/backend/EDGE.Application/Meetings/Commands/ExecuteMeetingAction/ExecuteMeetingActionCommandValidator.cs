using FluentValidation;

namespace EDGE.Application.Meetings.Commands.ExecuteMeetingAction;

public class ExecuteMeetingActionCommandValidator : AbstractValidator<ExecuteMeetingActionCommand>
{
    public ExecuteMeetingActionCommandValidator()
    {
        RuleFor(x => x.MeetingCode)
            .NotEmpty().WithMessage("Meeting code is required.");

        RuleFor(x => x.ActionType)
            .IsInEnum().WithMessage("Valid meeting action type is required.");

        RuleFor(x => x.ActionPayload)
            .MaximumLength(500).WithMessage("Action payload cannot exceed 500 characters.");
    }
}
