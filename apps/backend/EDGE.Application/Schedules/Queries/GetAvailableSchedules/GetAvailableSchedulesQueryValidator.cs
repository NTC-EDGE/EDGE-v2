using FluentValidation;

namespace EDGE.Application.Schedules.Queries.GetAvailableSchedules;

public class GetAvailableSchedulesQueryValidator : AbstractValidator<GetAvailableSchedulesQuery>
{
    public GetAvailableSchedulesQueryValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be greater than or equal to 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("PageSize must be greater than or equal to 1.");
    }
}
