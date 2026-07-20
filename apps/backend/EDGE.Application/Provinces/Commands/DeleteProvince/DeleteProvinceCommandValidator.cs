using FluentValidation;

namespace EDGE.Application.Provinces.Commands.DeleteProvince;

/// <summary>
/// Validator for DeleteProvinceCommand ensuring the ID is provided.
/// </summary>
public class DeleteProvinceCommandValidator : AbstractValidator<DeleteProvinceCommand>
{
    public DeleteProvinceCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Province ID is required for deletion.");
    }
}
