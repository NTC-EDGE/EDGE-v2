using FluentValidation;

namespace EDGE.Application.Applicants.Commands.CreateApplicant;

public class CreateApplicantCommandValidator : AbstractValidator<CreateApplicantCommand>
{
    public CreateApplicantCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required.");

        RuleFor(x => x.ApplicantType)
            .NotEmpty().WithMessage("Applicant type is required.")
            .Must(type => type.Equals("Individual", System.StringComparison.OrdinalIgnoreCase) || 
                          type.Equals("Company", System.StringComparison.OrdinalIgnoreCase))
            .WithMessage("Applicant type must be either 'Individual' or 'Company'.");
    }
}
