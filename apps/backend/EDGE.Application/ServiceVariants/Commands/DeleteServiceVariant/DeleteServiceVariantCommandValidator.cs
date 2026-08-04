using FluentValidation;

namespace EDGE.Application.ServiceVariants.Commands.DeleteServiceVariant;

public class DeleteServiceVariantCommandValidator : AbstractValidator<DeleteServiceVariantCommand>
{
    public DeleteServiceVariantCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
