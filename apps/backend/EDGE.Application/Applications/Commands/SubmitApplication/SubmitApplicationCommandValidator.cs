using FluentValidation;

namespace EDGE.Application.Applications.Commands.SubmitApplication;

public class SubmitApplicationCommandValidator : AbstractValidator<SubmitApplicationCommand>
{
    public SubmitApplicationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty()
            .WithMessage("Tenant ID is required.");

        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .WithMessage("Service ID is required.");

        RuleFor(x => x.SubmissionMode)
            .NotEmpty()
            .Must(mode => string.Equals(mode, "Single", System.StringComparison.OrdinalIgnoreCase) || 
                          string.Equals(mode, "Bulk", System.StringComparison.OrdinalIgnoreCase))
            .WithMessage("Submission mode must be either 'Single' or 'Bulk'.");

        RuleFor(x => x.AccountType)
            .NotEmpty()
            .Must(type => string.Equals(type, "Individual", System.StringComparison.OrdinalIgnoreCase) || 
                          string.Equals(type, "Company", System.StringComparison.OrdinalIgnoreCase))
            .WithMessage("Account type must be either 'Individual' or 'Company'.");

        RuleFor(x => x.Applicants)
            .NotEmpty()
            .WithMessage("At least one applicant is required.");

        RuleFor(x => x.Applicants)
            .Must(applicants => applicants.Count == 1)
            .When(x => string.Equals(x.SubmissionMode, "Single", System.StringComparison.OrdinalIgnoreCase))
            .WithMessage("Single submission mode does not allow multiple applicants.");
    }
}
