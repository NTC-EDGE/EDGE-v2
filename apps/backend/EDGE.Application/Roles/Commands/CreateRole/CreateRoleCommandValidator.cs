using FluentValidation;

namespace EDGE.Application.Roles.Commands;

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role Name is required.")
            .MaximumLength(100).WithMessage("Role Name must not exceed 100 characters.");

        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Role Key is required.")
            .MaximumLength(50).WithMessage("Role Key must not exceed 50 characters.");
    }
}
