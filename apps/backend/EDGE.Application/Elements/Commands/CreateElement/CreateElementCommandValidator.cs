using FluentValidation;

namespace EDGE.Application.Elements.Commands.CreateElement;

public class CreateElementCommandValidator : AbstractValidator<CreateElementCommand>
{
    public CreateElementCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Element Name is required.")
            .MaximumLength(500).WithMessage("Element Name must not exceed 500 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Element Code is required.")
            .MaximumLength(50).WithMessage("Element Code must not exceed 50 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
