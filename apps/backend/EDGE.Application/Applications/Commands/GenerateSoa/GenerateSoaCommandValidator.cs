using FluentValidation;

namespace EDGE.Application.Applications.Commands.GenerateSoa;

public class GenerateSoaCommandValidator : AbstractValidator<GenerateSoaCommand>
{
    public GenerateSoaCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty().WithMessage("ApplicationId is required.");
    }
}
