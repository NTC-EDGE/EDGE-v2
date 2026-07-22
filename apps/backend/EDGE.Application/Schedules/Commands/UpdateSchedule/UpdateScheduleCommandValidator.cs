using FluentValidation;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandValidator : AbstractValidator<UpdateScheduleCommand>
{
    public UpdateScheduleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Schedule Id is required.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");

        RuleFor(x => x.Venue)
            .NotEmpty().WithMessage("Venue is required.")
            .MaximumLength(200).WithMessage("Venue must not exceed 200 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("StartDate is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("EndDate is required.")
            .GreaterThan(x => x.StartDate).WithMessage("EndDate must be later than StartDate.");

        When(x => x.StartApplication.HasValue && x.EndApplication.HasValue, () =>
        {
            RuleFor(x => x.EndApplication!.Value)
                .GreaterThanOrEqualTo(x => x.StartApplication!.Value).WithMessage("EndApplication must be later than or equal to StartApplication.");
        });

        When(x => x.MaximumSlots.HasValue, () =>
        {
            RuleFor(x => x.MaximumSlots!.Value)
                .GreaterThan(0).WithMessage("MaximumSlots must be greater than 0 if specified.");
        });

        RuleFor(x => x.SeatNumber)
            .MaximumLength(50).WithMessage("SeatNumber must not exceed 50 characters.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500).WithMessage("Remarks must not exceed 500 characters.");
    }
}
