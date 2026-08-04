using FluentValidation;

namespace EDGE.Application.ServiceVariants.Commands.CreateServiceVariant;

public class CreateServiceVariantCommandValidator : AbstractValidator<CreateServiceVariantCommand>
{
    public CreateServiceVariantCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type is required.")
            .Must(type => type == "New" || type == "Renewal" || type == "Modification" || type == "Retaker" || type == "FirstTaker" || type == "First-taker" || type == "Upgrade")
            .WithMessage("Type must be New, Renewal, Modification, Retaker, FirstTaker (First-taker), or Upgrade.");
    }
}
