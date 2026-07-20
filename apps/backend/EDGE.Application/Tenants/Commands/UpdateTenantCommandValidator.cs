using FluentValidation;

namespace EDGE.Application.Tenants.Commands;

public class UpdateTenantCommandValidator : AbstractValidator<UpdateTenantCommand>
{
    public UpdateTenantCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Tenant ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tenant Name is required.")
            .MaximumLength(150).WithMessage("Tenant Name must not exceed 150 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Tenant Code is required.")
            .MaximumLength(50).WithMessage("Tenant Code must not exceed 50 characters.")
            .Matches(@"^[a-zA-Z0-9-_]+$").WithMessage("Tenant Code must contain only alphanumeric characters, hyphens, or underscores.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.RegionId)
            .NotEmpty().WithMessage("Region ID is required.");
    }
}
