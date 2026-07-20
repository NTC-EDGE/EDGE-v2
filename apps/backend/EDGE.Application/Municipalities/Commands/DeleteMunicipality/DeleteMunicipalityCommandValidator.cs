using FluentValidation;

namespace EDGE.Application.Municipalities.Commands.DeleteMunicipality;

/// <summary>
/// Validator for DeleteMunicipalityCommand ensuring the ID is provided.
/// </summary>
public class DeleteMunicipalityCommandValidator : AbstractValidator<DeleteMunicipalityCommand>
{
    public DeleteMunicipalityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Municipality ID is required for deletion.");
    }
}
