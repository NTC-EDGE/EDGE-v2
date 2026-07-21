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

        RuleFor(x => x.SeatNumber)
            .MaximumLength(50).WithMessage("SeatNumber must not exceed 50 characters.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500).WithMessage("Remarks must not exceed 500 characters.");
    }
}
