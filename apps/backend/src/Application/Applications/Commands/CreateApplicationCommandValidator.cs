using FluentValidation;

namespace NtcEdge.Application.Applications.Commands;

public class CreateApplicationCommandValidator : AbstractValidator<CreateApplicationCommand>
{
    public CreateApplicationCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Application Title is required.")
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters.");

        RuleFor(x => x.ApplicantName)
            .NotEmpty().WithMessage("Applicant Name is required.");
    }
}
