using FluentValidation;

namespace EDGE.Application.ServiceVariantRequirements.Commands.DeleteServiceVariantRequirement;

public class DeleteServiceVariantRequirementCommandValidator : AbstractValidator<DeleteServiceVariantRequirementCommand>
{
    public DeleteServiceVariantRequirementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");
    }
}
