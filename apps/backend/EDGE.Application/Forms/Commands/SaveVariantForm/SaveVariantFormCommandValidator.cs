using FluentValidation;

namespace EDGE.Application.Forms.Commands.SaveVariantForm;

public class SaveVariantFormCommandValidator : AbstractValidator<SaveVariantFormCommand>
{
    public SaveVariantFormCommandValidator()
    {
        RuleFor(x => x.VariantId)
            .NotEmpty().WithMessage("VariantId is required.");
    }
}
