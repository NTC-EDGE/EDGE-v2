using FluentValidation;

namespace EDGE.Application.TenantMembers.Commands;

public class AssignUserToTenantCommandValidator : AbstractValidator<AssignUserToTenantCommand>
{
    public AssignUserToTenantCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.RoleId)
            .NotEmpty().WithMessage("Role ID is required.");

        RuleFor(x => x.JobTitle)
            .MaximumLength(100).WithMessage("Job Title must not exceed 100 characters.");

        RuleFor(x => x.Level)
            .MaximumLength(100).WithMessage("Level must not exceed 100 characters.");

        RuleFor(x => x.Division)
            .NotEmpty().WithMessage("Division is required.")
            .MaximumLength(100).WithMessage("Division must not exceed 100 characters.");

        RuleFor(x => x.Position)
            .NotEmpty().WithMessage("Position is required.")
            .MaximumLength(100).WithMessage("Position must not exceed 100 characters.");

        RuleFor(x => x.Designation)
            .MaximumLength(100).WithMessage("Designation must not exceed 100 characters.");
    }
}
