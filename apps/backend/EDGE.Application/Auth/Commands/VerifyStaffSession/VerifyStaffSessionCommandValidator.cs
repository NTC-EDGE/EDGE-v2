using FluentValidation;

namespace EDGE.Application.Auth.Commands.VerifyStaffSession;

public class VerifyStaffSessionCommandValidator : AbstractValidator<VerifyStaffSessionCommand>
{
    public VerifyStaffSessionCommandValidator()
    {
        RuleFor(v => v.SelectedRegion)
            .NotEmpty()
            .WithMessage("Selected region is required for staff membership verification.")
            .MaximumLength(150)
            .WithMessage("Selected region must not exceed 150 characters.");
    }
}
