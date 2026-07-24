using FluentValidation;

namespace EDGE.Application.ServiceVariantRequirements.Commands.CreateServiceVariantRequirement;

public class CreateServiceVariantRequirementCommandValidator : AbstractValidator<CreateServiceVariantRequirementCommand>
{
    public CreateServiceVariantRequirementCommandValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("Service Variant ID is required.");

        RuleFor(x => x.Requirements)
            .NotEmpty().WithMessage("At least one requirement item is required.");

        RuleForEach(x => x.Requirements).ChildRules(item =>
        {
            item.RuleFor(x => x.RequirementId)
                .NotEmpty().WithMessage("Requirement ID is required.");

            item.RuleFor(x => x.ApplicationTypeKey)
                .MaximumLength(100).WithMessage("Application Type Key must not exceed 100 characters.");
        });
    }
}
