using FluentValidation;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandValidator : AbstractValidator<UpdateScheduleCommand>
{
    public UpdateScheduleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Schedule Id is required.");

        RuleFor(x => x.Venue)
            .NotEmpty().WithMessage("Venue is required.")
            .MaximumLength(200).WithMessage("Venue must not exceed 200 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("StartDate is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("EndDate is required.")
            .GreaterThan(x => x.StartDate).WithMessage("EndDate must be later than StartDate.");

        When(x => x.StartApplication.HasValue, () =>
        {
            RuleFor(x => x.StartApplication!.Value)
                .LessThan(x => x.StartDate).WithMessage("Start Application date must be earlier than the exam Start Date.");
        });

        When(x => x.EndApplication.HasValue, () =>
        {
            RuleFor(x => x.EndApplication!.Value)
                .LessThan(x => x.StartDate).WithMessage("End Application date must be earlier than the exam Start Date.");
        });

        When(x => x.StartApplication.HasValue && x.EndApplication.HasValue, () =>
        {
            RuleFor(x => x.StartApplication!.Value)
                .LessThanOrEqualTo(x => x.EndApplication!.Value).WithMessage("Start Application date must not be later than End Application date.");
        });

        When(x => x.MaximumSlots.HasValue, () =>
        {
            RuleFor(x => x.MaximumSlots!.Value)
                .GreaterThan(0).WithMessage("MaximumSlots must be greater than 0 if specified.");
        });

        RuleFor(x => x.Remarks)
            .MaximumLength(500).WithMessage("Remarks must not exceed 500 characters.");
    }
}
