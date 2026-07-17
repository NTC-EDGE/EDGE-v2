using FluentValidation;

namespace EDGE.Application.Applications.Commands;

public class UpdateApplicationCommandValidator : AbstractValidator<UpdateApplicationCommand>
{
    public UpdateApplicationCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Application ID is required.");

        RuleFor(v => v.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .NotEmpty().WithMessage("Title is required.");

        RuleFor(v => v.ApplicantName)
            .MaximumLength(100).WithMessage("Applicant name must not exceed 100 characters.")
            .NotEmpty().WithMessage("Applicant name is required.");
    }
}
