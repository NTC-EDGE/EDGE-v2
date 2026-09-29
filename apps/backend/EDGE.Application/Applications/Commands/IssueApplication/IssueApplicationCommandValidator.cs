using System;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.IssueApplication;

public class IssueApplicationCommandValidator : AbstractValidator<IssueApplicationCommand>
{
    public IssueApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("Application ID is required.");

        RuleFor(x => x.FormNumber)
            .NotEmpty()
            .WithMessage("Form Control Number is required.")
            .MaximumLength(100)
            .WithMessage("Form Control Number must not exceed 100 characters.");

        RuleFor(x => x.LicenseNumber)
            .MaximumLength(100)
            .WithMessage("License Number must not exceed 100 characters.");

        RuleFor(x => x.CallSign)
            .MaximumLength(50)
            .WithMessage("Call Sign must not exceed 50 characters.");

        RuleFor(x => x.DocumentType)
            .NotEmpty()
            .WithMessage("Document Type is required.")
            .MaximumLength(50)
            .WithMessage("Document Type must not exceed 50 characters.");

        RuleFor(x => x.ExpiryDate)
            .GreaterThan(x => x.IssueDate)
            .When(x => x.ExpiryDate.HasValue)
            .WithMessage("Expiry Date must be later than the Issue Date.");
    }
}
