using FluentValidation;

namespace EDGE.Application.Users.Commands.AdminCreateUser;

public class AdminCreateUserCommandValidator : AbstractValidator<AdminCreateUserCommand>
{
    public AdminCreateUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

        RuleFor(x => x.RoleKey)
            .NotEmpty().WithMessage("Role key is required.")
            .MaximumLength(50).WithMessage("Role key must not exceed 50 characters.");

        When(x => !string.IsNullOrEmpty(x.MiddleName), () =>
        {
            RuleFor(x => x.MiddleName)
                .MaximumLength(100).WithMessage("Middle name must not exceed 100 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Suffix), () =>
        {
            RuleFor(x => x.Suffix)
                .MaximumLength(20).WithMessage("Suffix must not exceed 20 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.ContactNumber), () =>
        {
            RuleFor(x => x.ContactNumber)
                .MaximumLength(50).WithMessage("Contact number must not exceed 50 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Password), () =>
        {
            RuleFor(x => x.Password)
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.");
        });

        When(x => !string.IsNullOrEmpty(x.JobTitle), () =>
        {
            RuleFor(x => x.JobTitle)
                .MaximumLength(150).WithMessage("Job title must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Division), () =>
        {
            RuleFor(x => x.Division)
                .MaximumLength(150).WithMessage("Division must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Position), () =>
        {
            RuleFor(x => x.Position)
                .MaximumLength(150).WithMessage("Position must not exceed 150 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Designation), () =>
        {
            RuleFor(x => x.Designation)
                .MaximumLength(150).WithMessage("Designation must not exceed 150 characters.");
        });
    }
}
