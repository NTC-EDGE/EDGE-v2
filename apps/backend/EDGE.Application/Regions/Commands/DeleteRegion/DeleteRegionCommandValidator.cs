using FluentValidation;

namespace EDGE.Application.Regions.Commands.DeleteRegion;

/// <summary>
/// Validator for DeleteRegionCommand ensuring the ID is provided.
/// </summary>
public class DeleteRegionCommandValidator : AbstractValidator<DeleteRegionCommand>
{
    public DeleteRegionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Region ID is required for deletion.");
    }
}
