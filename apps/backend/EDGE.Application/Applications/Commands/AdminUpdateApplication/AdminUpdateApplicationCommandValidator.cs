using FluentValidation;

namespace EDGE.Application.Applications.Commands.AdminUpdateApplication;

public class AdminUpdateApplicationCommandValidator : AbstractValidator<AdminUpdateApplicationCommand>
{
    public AdminUpdateApplicationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ApplicationId is required.");

        RuleFor(x => x.ContactDetails!.Email)
            .EmailAddress().WithMessage("Invalid Contact Details Email address format.")
            .When(x => x.ContactDetails != null && !string.IsNullOrEmpty(x.ContactDetails.Email));

        RuleFor(x => x.CompanyDetails!.Email)
            .EmailAddress().WithMessage("Invalid Company Details Email address format.")
            .When(x => x.CompanyDetails != null && !string.IsNullOrEmpty(x.CompanyDetails.Email));
    }
}
