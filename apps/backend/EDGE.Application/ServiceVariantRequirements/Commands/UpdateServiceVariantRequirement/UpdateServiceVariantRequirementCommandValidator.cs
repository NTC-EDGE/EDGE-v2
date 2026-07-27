using FluentValidation;

namespace EDGE.Application.ServiceVariantRequirements.Commands.UpdateServiceVariantRequirement;

public class UpdateServiceVariantRequirementCommandValidator : AbstractValidator<UpdateServiceVariantRequirementCommand>
{
    public UpdateServiceVariantRequirementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");

        RuleFor(x => x.RequirementId)
            .NotEmpty().WithMessage("Requirement ID is required.");

        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("Service Variant ID is required.");

        RuleFor(x => x.ContextKey)
            .MaximumLength(100).WithMessage("Context Key must not exceed 100 characters.");

    }
}
