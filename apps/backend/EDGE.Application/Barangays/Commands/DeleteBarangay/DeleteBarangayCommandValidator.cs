using FluentValidation;
using EDGE.Application.Barangays.Commands.DeleteBarangay;

namespace EDGE.Application.Barangays.Commands.DeleteBarangay;

/// <summary>
/// Validator for DeleteBarangayCommand ensuring the ID is provided.
/// </summary>
public class DeleteBarangayCommandValidator : AbstractValidator<DeleteBarangayCommand>
{
    public DeleteBarangayCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Barangay ID is required for deletion.");
    }
}
