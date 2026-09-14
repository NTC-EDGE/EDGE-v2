using FluentValidation;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandValidator : AbstractValidator<UpdateScheduleCommand>
{
    public UpdateScheduleCommandValidator(IScheduleRepository scheduleRepository)
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Schedule Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                var schedule = await scheduleRepository.GetByIdAsync(id, asNoTracking: true, cancellationToken);
                return schedule != null && schedule.Service?.ServiceCategory?.Type == ServiceCategoryType.Exam;
            })
            .WithMessage("Schedule does not exist or does not belong to an Examination service.");

        RuleFor(x => x.Venue)
            .NotEmpty().WithMessage("Venue is required.")
            .MaximumLength(200).WithMessage("Venue must not exceed 200 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("StartDate is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("EndDate is required.")
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("EndDate must be on or later than StartDate.");

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
