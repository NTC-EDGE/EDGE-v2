using FluentValidation;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;

namespace EDGE.Application.Schedules.Commands.CreateSchedule;

public class CreateScheduleCommandValidator : AbstractValidator<CreateScheduleCommand>
{
    public CreateScheduleCommandValidator(IServiceRepository serviceRepository)
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.")
            .MustAsync(async (serviceId, cancellationToken) =>
            {
                var service = await serviceRepository.GetByIdAsync(serviceId, cancellationToken);
                return service != null && service.ServiceCategory?.Type == ServiceCategoryType.Exam;
            })
            .WithMessage("Schedules can only be created for Examination services.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");

        RuleFor(x => x.Venue)
            .NotEmpty().WithMessage("Venue is required.")
            .MaximumLength(200).WithMessage("Venue must not exceed 200 characters.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("StartDate is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("EndDate is required.")
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("EndDate must be on or later than StartDate.");

        RuleFor(x => x.IsPublished)
            .Must((x, isPublished) => !isPublished || (x.StartApplication.HasValue && x.EndApplication.HasValue))
            .WithMessage("Please set the Start Application and End Application dates before publishing the schedule.");

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

        RuleFor(x => x.StartTime)
            .MaximumLength(50).WithMessage("StartTime must not exceed 50 characters.");

        RuleFor(x => x.EndTime)
            .MaximumLength(50).WithMessage("EndTime must not exceed 50 characters.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500).WithMessage("Remarks must not exceed 500 characters.");
    }
}
