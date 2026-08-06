using FluentValidation;

namespace EDGE.Application.ServiceVariantElements.Commands.DeleteServiceVariantElement;

public class DeleteServiceVariantElementCommandValidator
    : AbstractValidator<DeleteServiceVariantElementCommand>
{
    public DeleteServiceVariantElementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Element ID is required.");
    }
}
