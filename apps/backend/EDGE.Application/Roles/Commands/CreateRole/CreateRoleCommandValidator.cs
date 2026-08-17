using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator(IRoleRepository roleRepository)
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role Name is required.")
            .MaximumLength(100).WithMessage("Role Name must not exceed 100 characters.")
            .MustAsync(async (cmd, name, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(name)) return true;
                return await roleRepository.IsRoleNameUniqueAsync(name, cmd.TenantId, null, cancellationToken);
            })
            .WithMessage("A role with this name already exists in this tenant or as a standard role.");

        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Role Key is required.")
            .MaximumLength(50).WithMessage("Role Key must not exceed 50 characters.");
    }
}
