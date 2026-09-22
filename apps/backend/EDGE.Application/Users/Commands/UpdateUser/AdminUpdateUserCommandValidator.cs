using FluentValidation;

namespace EDGE.Application.Users.Commands.UpdateUser;

public class AdminUpdateUserCommandValidator : AbstractValidator<AdminUpdateUserCommand>
{
    public AdminUpdateUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First Name is required.")
            .MaximumLength(100).WithMessage("First Name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last Name is required.")
            .MaximumLength(100).WithMessage("Last Name must not exceed 100 characters.");

        When(x => !string.IsNullOrEmpty(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("A valid email address is required.")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.MiddleName), () =>
        {
            RuleFor(x => x.MiddleName)
                .MaximumLength(100).WithMessage("Middle Name must not exceed 100 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Suffix), () =>
        {
            RuleFor(x => x.Suffix)
                .MaximumLength(50).WithMessage("Suffix must not exceed 50 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.ContactNumber), () =>
        {
            RuleFor(x => x.ContactNumber)
                .MaximumLength(50).WithMessage("Contact number must not exceed 50 characters.");
        });
    }
}
