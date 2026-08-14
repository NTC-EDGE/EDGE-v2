using System;
using FluentValidation;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplicant;

public class AdminUpdateApplicantCommandValidator : AbstractValidator<AdminUpdateApplicantCommand>
{
    public AdminUpdateApplicantCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty().WithMessage("Application ID is required.");

        RuleFor(x => x.ApplicantId)
            .NotEmpty().WithMessage("Applicant ID is required.");

        When(x => !string.IsNullOrWhiteSpace(x.ApplicantType), () =>
        {
            RuleFor(x => x.ApplicantType)
                .Must(type => Enum.TryParse<ApplicantType>(type, true, out _))
                .WithMessage("ApplicantType must be either 'Individual' or 'Company'.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Status), () =>
        {
            RuleFor(x => x.Status)
                .Must(status => Enum.TryParse<ApplicantStatus>(status, true, out _))
                .WithMessage("Status must be a valid ApplicantStatus ('Complete', 'Incomplete', 'ForEndorsement').");
        });

        // Email validation for nested details and flat email
        When(x => !string.IsNullOrWhiteSpace(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Email format is invalid.");
        });

        When(x => x.Details != null && !string.IsNullOrWhiteSpace(x.Details.EmailAddress), () =>
        {
            RuleFor(x => x.Details!.EmailAddress)
                .EmailAddress().WithMessage("Details email address format is invalid.");
        });

        When(x => x.Company != null && !string.IsNullOrWhiteSpace(x.Company.Email), () =>
        {
            RuleFor(x => x.Company!.Email)
                .EmailAddress().WithMessage("Company email format is invalid.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.CompanyEmail), () =>
        {
            RuleFor(x => x.CompanyEmail)
                .EmailAddress().WithMessage("Company email format is invalid.");
        });

        // Company Entity Type validation
        When(x => x.Company != null && !string.IsNullOrWhiteSpace(x.Company.EntityType), () =>
        {
            RuleFor(x => x.Company!.EntityType)
                .Must(et => Enum.TryParse<CompanyEntityType>(et, true, out _))
                .WithMessage("Company entity type is invalid.");
        });

        // Height & Weight validation
        When(x => x.Height.HasValue, () =>
        {
            RuleFor(x => x.Height!.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Height cannot be negative.");
        });

        When(x => x.Weight.HasValue, () =>
        {
            RuleFor(x => x.Weight!.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Weight cannot be negative.");
        });

        When(x => x.Details != null && x.Details.Height.HasValue, () =>
        {
            RuleFor(x => x.Details!.Height!.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Height cannot be negative.");
        });

        When(x => x.Details != null && x.Details.Weight.HasValue, () =>
        {
            RuleFor(x => x.Details!.Weight!.Value)
                .GreaterThanOrEqualTo(0).WithMessage("Weight cannot be negative.");
        });
    }
}
