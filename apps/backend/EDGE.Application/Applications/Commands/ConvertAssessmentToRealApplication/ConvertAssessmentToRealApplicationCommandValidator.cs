using FluentValidation;

namespace EDGE.Application.Applications.Commands.ConvertAssessmentToRealApplication;

public class ConvertAssessmentToRealApplicationCommandValidator : AbstractValidator<ConvertAssessmentToRealApplicationCommand>
{
    public ConvertAssessmentToRealApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("Application ID is required.");
    }
}
