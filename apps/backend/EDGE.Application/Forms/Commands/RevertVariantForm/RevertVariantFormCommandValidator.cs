using FluentValidation;

namespace EDGE.Application.Forms.Commands.RevertVariantForm;

public class RevertVariantFormCommandValidator : AbstractValidator<RevertVariantFormCommand>
{
    public RevertVariantFormCommandValidator()
    {
        RuleFor(x => x.VariantId)
            .NotEmpty().WithMessage("VariantId is required.");
    }
}
