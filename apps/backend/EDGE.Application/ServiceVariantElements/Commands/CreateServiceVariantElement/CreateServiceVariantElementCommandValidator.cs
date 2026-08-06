using FluentValidation;

namespace EDGE.Application.ServiceVariantElements.Commands.CreateServiceVariantElement;

public class CreateServiceVariantElementCommandValidator
    : AbstractValidator<CreateServiceVariantElementCommand>
{
    public CreateServiceVariantElementCommandValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariant ID is required.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(50).WithMessage("Code must not exceed 50 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
