using FluentValidation;

namespace EDGE.Application.Forms.Commands.ActivateVariantForm;

public class ActivateVariantFormCommandValidator : AbstractValidator<ActivateVariantFormCommand>
{
    public ActivateVariantFormCommandValidator()
    {
        RuleFor(x => x.VariantId)
            .NotEmpty().WithMessage("VariantId is required.");
    }
}
