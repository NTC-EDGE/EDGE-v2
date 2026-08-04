using FluentValidation;

namespace EDGE.Application.Schedules.Queries.GetSchedules;

public class GetSchedulesQueryValidator : AbstractValidator<GetSchedulesQuery>
{
    public GetSchedulesQueryValidator()
    {
        When(x => x.TenantId.HasValue, () =>
        {
            RuleFor(x => x.TenantId!.Value)
                .NotEmpty().WithMessage("TenantId must not be empty if specified.");
        });

        When(x => x.ServiceId.HasValue, () =>
        {
            RuleFor(x => x.ServiceId!.Value)
                .NotEmpty().WithMessage("ServiceId must not be empty if specified.");
        });

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be greater than or equal to 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("PageSize must be greater than or equal to 1.");
    }
}
