using FluentValidation;

namespace EDGE.Application.Fees.Calculations;

public class CalculateApplicationFeesQueryValidator : AbstractValidator<CalculateApplicationFeesQuery>
{
    public CalculateApplicationFeesQueryValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("ApplicationId is required.");
    }
}
