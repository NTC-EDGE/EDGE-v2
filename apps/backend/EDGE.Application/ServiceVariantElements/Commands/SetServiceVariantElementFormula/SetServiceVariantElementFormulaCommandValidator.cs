using FluentValidation;
using EDGE.Application.Fees.Calculations;

namespace EDGE.Application.ServiceVariantElements.Commands.SetServiceVariantElementFormula;

public class SetServiceVariantElementFormulaCommandValidator : AbstractValidator<SetServiceVariantElementFormulaCommand>
{
    public SetServiceVariantElementFormulaCommandValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariantId is required.");

        RuleFor(x => x.ElementId)
            .NotEmpty().WithMessage("ElementId is required.");

        RuleFor(x => x.FormulaExpression)
            .NotEmpty().WithMessage("Formula expression is required.")
            .MaximumLength(500).WithMessage("Formula expression must not exceed 500 characters.")
            .Custom((formula, context) =>
            {
                var (isValid, errorMessage) = DynamicFeeFormulaEvaluator.Validate(formula);
                if (!isValid)
                {
                    context.AddFailure(nameof(SetServiceVariantElementFormulaCommand.FormulaExpression), errorMessage ?? "Invalid formula expression syntax.");
                }
            });

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");
    }
}
