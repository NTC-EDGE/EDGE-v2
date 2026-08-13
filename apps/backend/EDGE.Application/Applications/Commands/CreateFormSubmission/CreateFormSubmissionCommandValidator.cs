using FluentValidation;

namespace EDGE.Application.Applications.Commands.CreateFormSubmission;

public class CreateFormSubmissionCommandValidator : AbstractValidator<CreateFormSubmissionCommand>
{
    public CreateFormSubmissionCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty().WithMessage("ApplicationId is required.");

        RuleFor(x => x.FormId)
            .NotEmpty().WithMessage("FormId is required.");
    }
}
