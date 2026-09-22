using FluentValidation;

namespace EDGE.Application.Fees.Calculations;

public class CalculateFeesQueryValidator : AbstractValidator<CalculateFeesQuery>
{
    public CalculateFeesQueryValidator()
    {
        RuleFor(x => x.Activity)
            .NotEmpty()
            .WithMessage("Activity / Category is required.");

        RuleFor(x => x.ApplicationType)
            .NotEmpty()
            .WithMessage("Application Type is required.");

        RuleFor(x => x.ValidityYears)
            .GreaterThan(0)
            .WithMessage("ValidityYears must be greater than 0.");

        RuleFor(x => x.NoOfUnits)
            .GreaterThan(0)
            .WithMessage("NoOfUnits must be greater than 0.");

        RuleFor(x => x.AdditionalServicesCount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("AdditionalServicesCount cannot be negative.");

        RuleFor(x => x.NoOfCopies)
            .GreaterThanOrEqualTo(1)
            .WithMessage("NoOfCopies must be at least 1.");
    }
}
