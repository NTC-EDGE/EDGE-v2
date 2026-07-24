using FluentValidation;

namespace EDGE.Application.Applications.Commands.UpdateApplicationApplicant;

public class UpdateApplicationApplicantCommandValidator : AbstractValidator<UpdateApplicationApplicantCommand>
{
    public UpdateApplicationApplicantCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("Application ID is required.");

        RuleFor(x => x.ApplicantId)
            .NotEmpty()
            .WithMessage("Applicant ID is required.");
    }
}
