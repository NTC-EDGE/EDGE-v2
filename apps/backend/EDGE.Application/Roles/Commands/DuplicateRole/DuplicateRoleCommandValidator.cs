using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class DuplicateRoleCommandValidator : AbstractValidator<DuplicateRoleCommand>
{
    public DuplicateRoleCommandValidator(IRoleRepository roleRepository)
    {
        RuleFor(x => x.SourceRoleId)
            .NotEmpty().WithMessage("Source Role ID is required.");

        RuleFor(x => x.TargetTenantId)
            .NotEmpty().WithMessage("Target Tenant ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role Name is required.")
            .MaximumLength(100).WithMessage("Role Name must not exceed 100 characters.")
            .MustAsync(async (cmd, name, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(name)) return true;
                return await roleRepository.IsRoleNameUniqueAsync(name, cmd.TargetTenantId, null, cancellationToken);
            })
            .WithMessage("A role with this name already exists in this tenant or as a standard role.");

        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Role Key is required.")
            .MaximumLength(50).WithMessage("Role Key must not exceed 50 characters.")
            .Matches(@"^[a-z0-9_.-]+$").WithMessage("Role Key can only contain lowercase letters, numbers, underscores, dots, and hyphens.");
    }
}
