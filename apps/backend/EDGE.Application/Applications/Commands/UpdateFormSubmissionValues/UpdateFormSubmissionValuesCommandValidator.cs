using FluentValidation;

namespace EDGE.Application.Applications.Commands.UpdateFormSubmissionValues;

public class UpdateFormSubmissionValuesCommandValidator : AbstractValidator<UpdateFormSubmissionValuesCommand>
{
    public UpdateFormSubmissionValuesCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty().WithMessage("ApplicationId is required.");

        RuleFor(x => x.SubmissionId)
            .NotEmpty().WithMessage("SubmissionId is required.");
    }
}
