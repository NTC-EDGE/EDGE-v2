using FluentValidation;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplicantProfile;

public class AdminUpdateApplicantProfileCommandValidator : AbstractValidator<AdminUpdateApplicantProfileCommand>
{
    public AdminUpdateApplicantProfileCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty().WithMessage("ApplicationId is required.");

        RuleFor(x => x.ApplicantId)
            .NotEmpty().WithMessage("ApplicantId is required.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Invalid Email address format.")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.CompanyEmail)
            .EmailAddress().WithMessage("Invalid Company Email address format.")
            .When(x => !string.IsNullOrEmpty(x.CompanyEmail));
    }
}
