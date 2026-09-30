using FluentValidation;

namespace EDGE.Application.ServiceVariants.Queries.GetServiceVariantFormula;

public class GetServiceVariantFormulaQueryValidator : AbstractValidator<GetServiceVariantFormulaQuery>
{
    public GetServiceVariantFormulaQueryValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariantId is required.");
    }
}
