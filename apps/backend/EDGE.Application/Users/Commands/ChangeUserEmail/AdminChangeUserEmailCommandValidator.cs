using FluentValidation;

namespace EDGE.Application.Users.Commands.ChangeUserEmail;

public class AdminChangeUserEmailCommandValidator : AbstractValidator<AdminChangeUserEmailCommand>
{
    public AdminChangeUserEmailCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.NewEmail)
            .NotEmpty().WithMessage("New email address is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(256).WithMessage("Email address must not exceed 256 characters.");
    }
}
