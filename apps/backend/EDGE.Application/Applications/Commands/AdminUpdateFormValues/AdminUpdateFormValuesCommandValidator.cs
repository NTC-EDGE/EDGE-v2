using FluentValidation;

namespace EDGE.Application.Applications.Commands.AdminUpdateFormValues;

public class AdminUpdateFormValuesCommandValidator : AbstractValidator<AdminUpdateFormValuesCommand>
{
    public AdminUpdateFormValuesCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty().WithMessage("ApplicationId is required.");

        RuleFor(x => x.ApplicantId)
            .NotEmpty().WithMessage("ApplicantId is required.");

        RuleFor(x => x.FormFields)
            .NotNull().WithMessage("FormFields list cannot be null.");
    }
}
