using FluentValidation;

namespace EDGE.Application.Applications.Commands.AddApplicantToApplication;

public class AddApplicantToApplicationCommandValidator : AbstractValidator<AddApplicantToApplicationCommand>
{
    public AddApplicantToApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("Application ID is required.");
    }
}
