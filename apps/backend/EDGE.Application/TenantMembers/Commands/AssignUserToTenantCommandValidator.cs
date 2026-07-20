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

        RuleFor(x => x.JobTitle)
            .NotEmpty().WithMessage("Job Title is required.")
            .MaximumLength(100).WithMessage("Job Title must not exceed 100 characters.");

        RuleFor(x => x.ContactNumber)
            .NotEmpty().WithMessage("Contact Number is required.")
            .MaximumLength(50).WithMessage("Contact Number must not exceed 50 characters.");

        RuleFor(x => x.Department)
            .MaximumLength(100).WithMessage("Department name must not exceed 100 characters.");
    }
}
