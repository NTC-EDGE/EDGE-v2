using FluentValidation;

namespace EDGE.Application.Applications.Commands.UpdateSoa;

public class UpdateSoaCommandValidator : AbstractValidator<UpdateSoaCommand>
{
    public UpdateSoaCommandValidator()
    {
        RuleFor(x => x.SoaId)
            .NotEmpty().WithMessage("SoaId is required.");
    }
}
