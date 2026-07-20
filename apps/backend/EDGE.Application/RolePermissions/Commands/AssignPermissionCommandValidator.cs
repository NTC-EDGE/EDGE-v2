using FluentValidation;
using EDGE.Domain.Authorization;

namespace EDGE.Application.RolePermissions.Commands;

public class AssignPermissionCommandValidator : AbstractValidator<AssignPermissionCommand>
{
    public AssignPermissionCommandValidator()
    {
        RuleFor(x => x.RoleId)
            .NotEmpty().WithMessage("Role ID is required.");

        RuleFor(x => x.PermissionKey)
            .NotEmpty().WithMessage("Permission Key is required.")
            .Must(key => Permissions.AllKeys.Contains(key))
            .WithMessage("Permission Key is not a recognized system permission.");
    }
}
