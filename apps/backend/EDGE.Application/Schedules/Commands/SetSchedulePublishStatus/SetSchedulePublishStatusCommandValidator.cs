using FluentValidation;

namespace EDGE.Application.Schedules.Commands.SetSchedulePublishStatus;

public class SetSchedulePublishStatusCommandValidator : AbstractValidator<SetSchedulePublishStatusCommand>
{
    public SetSchedulePublishStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Schedule Id is required.");
    }
}
