using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Requirements.Commands.UpdateRequirement;

public class UpdateRequirementCommandValidator : AbstractValidator<UpdateRequirementCommand>
{
    public UpdateRequirementCommandValidator(IRequirementRepository repository)
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(500).WithMessage("Name must not exceed 500 characters.")
            .MustAsync(async (model, name, token) => await repository.IsNameUniqueAsync(name, model.Id, token))
            .WithMessage("Requirement Name must be unique.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
