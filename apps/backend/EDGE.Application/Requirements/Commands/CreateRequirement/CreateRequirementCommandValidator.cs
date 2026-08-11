using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Requirements.Commands.CreateRequirement;

public class CreateRequirementCommandValidator : AbstractValidator<CreateRequirementCommand>
{
    public CreateRequirementCommandValidator(IRequirementRepository repository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(500).WithMessage("Name must not exceed 500 characters.")
            .MustAsync(async (name, token) => await repository.IsNameUniqueAsync(name, null, token))
            .WithMessage("Requirement Name must be unique.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
