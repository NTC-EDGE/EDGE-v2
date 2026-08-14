using FluentValidation;

namespace EDGE.Application.Requirements.Commands.AttachServiceVariantRequirement;

public class AttachServiceVariantRequirementCommandValidator : AbstractValidator<AttachServiceVariantRequirementCommand>
{
    public AttachServiceVariantRequirementCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");

        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("Service Variant ID is required.");

        RuleFor(x => x.RequirementId)
            .NotEmpty().WithMessage("Requirement ID is required.");
    }
}
