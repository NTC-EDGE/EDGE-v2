using FluentValidation;

namespace EDGE.Application.Requirements.Commands.DeleteRequirement;

public class DeleteRequirementCommandValidator : AbstractValidator<DeleteRequirementCommand>
{
    public DeleteRequirementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");
    }
}
