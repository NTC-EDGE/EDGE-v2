using FluentValidation;

namespace EDGE.Application.Applications.Commands.ReprocessAssessment;

public class ReprocessAssessmentCommandValidator : AbstractValidator<ReprocessAssessmentCommand>
{
    public ReprocessAssessmentCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("Application ID is required.");
    }
}
