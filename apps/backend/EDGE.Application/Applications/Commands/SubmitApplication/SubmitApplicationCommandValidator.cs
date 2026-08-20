using FluentValidation;

namespace EDGE.Application.Applications.Commands.SubmitApplication;

public class SubmitApplicationCommandValidator : AbstractValidator<SubmitApplicationCommand>
{
    public SubmitApplicationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty()
            .When(x => !x.IsDraft)
            .WithMessage("Tenant ID is required.");

        RuleFor(x => x.ServiceId)
            .NotEmpty()
            .When(x => !x.IsDraft)
            .WithMessage("Service ID is required.");

        RuleFor(x => x.SubmissionMode)
            .Must(mode => string.IsNullOrEmpty(mode) ||
                          string.Equals(mode, "Single", StringComparison.OrdinalIgnoreCase) ||
                          string.Equals(mode, "Bulk", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Submission mode must be either 'Single' or 'Bulk'.");

        // Applicants list validation (strictly enforced when NOT a draft)
        RuleFor(x => x.Applicants)
            .NotEmpty()
            .When(x => !x.IsDraft)
            .WithMessage("At least one applicant is required.");

        // Single — exactly 1 (when NOT a draft)
        RuleFor(x => x.Applicants)
            .Must(a => a.Count == 1)
            .When(x => !x.IsDraft && string.Equals(x.SubmissionMode, "Single", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Single submission must have exactly one applicant.");

        // Bulk — at least 1 (when NOT a draft)
        RuleFor(x => x.Applicants)
            .Must(a => a.Count >= 1)
            .When(x => !x.IsDraft && string.Equals(x.SubmissionMode, "Bulk", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Bulk submission requires at least one applicant.");

        // Each applicant validation rules (enforced strictly when NOT a draft)
        RuleForEach(x => x.Applicants).ChildRules(applicant =>
        {
            applicant.RuleFor(a => a.FirstName)
                .NotEmpty()
                .WithMessage("Applicant first name is required.");

            applicant.RuleFor(a => a.LastName)
                .NotEmpty()
                .WithMessage("Applicant last name is required.");

            applicant.RuleFor(a => a.Email)
                .NotEmpty()
                .EmailAddress()
                .WithMessage("A valid applicant email address is required.");

            applicant.RuleFor(a => a.ContactNumber)
                .NotEmpty()
                .WithMessage("Applicant contact number is required.")
                .Matches(@"^(0\d{10}|\+63\d{10}|63\d{10})$")
                .WithMessage("Applicant contact number must start with 0 (11 digits, e.g. 09171234567) or +63 (e.g. +639171234567).");

            // Each FormFieldValue must have a non-empty FieldId
            applicant.RuleForEach(a => a.FormFieldValues).ChildRules(fv =>
            {
                fv.RuleFor(f => f.FieldId)
                    .NotEmpty()
                    .When(f => string.IsNullOrEmpty(f.FieldLabel))
                    .WithMessage("FieldId or FieldLabel is required for each form field value.");
            });
        }).When(x => !x.IsDraft);

        RuleFor(x => x.ServiceVariantId)
            .Must(id => id == null || id != Guid.Empty)
            .WithMessage("Service Variant ID cannot be an empty GUID.");

        RuleForEach(x => x.ServiceVariantElementIds)
            .NotEmpty()
            .When(x => !x.IsDraft)
            .WithMessage("Service Variant Element ID cannot be empty.");
    }
}