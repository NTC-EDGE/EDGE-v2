using FluentValidation;

namespace EDGE.Application.ServiceVariantRequirements.Commands.UpdateServiceVariantRequirement;

public class UpdateServiceVariantRequirementCommandValidator : AbstractValidator<UpdateServiceVariantRequirementCommand>
{
    public UpdateServiceVariantRequirementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");
    }
}
