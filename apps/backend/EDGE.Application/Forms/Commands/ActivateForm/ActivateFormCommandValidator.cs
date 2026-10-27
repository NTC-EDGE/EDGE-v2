using FluentValidation;

namespace EDGE.Application.Forms.Commands.ActivateForm;

public class ActivateFormCommandValidator : AbstractValidator<ActivateFormCommand>
{
    public ActivateFormCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Form Id is required.");
    }
}
