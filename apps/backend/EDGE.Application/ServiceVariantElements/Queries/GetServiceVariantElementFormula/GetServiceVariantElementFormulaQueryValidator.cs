using FluentValidation;

namespace EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElementFormula;

public class GetServiceVariantElementFormulaQueryValidator : AbstractValidator<GetServiceVariantElementFormulaQuery>
{
    public GetServiceVariantElementFormulaQueryValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariantId is required.");

        RuleFor(x => x.ElementId)
            .NotEmpty().WithMessage("ElementId is required.");
    }
}
