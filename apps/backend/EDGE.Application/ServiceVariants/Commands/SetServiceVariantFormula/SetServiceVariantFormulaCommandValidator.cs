using FluentValidation;
using EDGE.Application.Fees.Calculations;

namespace EDGE.Application.ServiceVariants.Commands.SetServiceVariantFormula;

public class SetServiceVariantFormulaCommandValidator : AbstractValidator<SetServiceVariantFormulaCommand>
{
    public SetServiceVariantFormulaCommandValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariantId is required.");

        RuleFor(x => x.FormulaExpression)
            .NotEmpty().WithMessage("Formula expression is required.")
            .MaximumLength(500).WithMessage("Formula expression must not exceed 500 characters.")
            .Custom((formula, context) =>
            {
                var (isValid, errorMessage) = DynamicFeeFormulaEvaluator.Validate(formula);
                if (!isValid)
                {
                    context.AddFailure(nameof(SetServiceVariantFormulaCommand.FormulaExpression), errorMessage ?? "Invalid formula expression syntax.");
                }
            });

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");
    }
}
