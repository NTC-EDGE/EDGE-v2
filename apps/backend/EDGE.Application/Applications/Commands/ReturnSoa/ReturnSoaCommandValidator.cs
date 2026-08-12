using FluentValidation;

namespace EDGE.Application.Applications.Commands.ReturnSoa;

public class ReturnSoaCommandValidator : AbstractValidator<ReturnSoaCommand>
{
    public ReturnSoaCommandValidator()
    {
        RuleFor(x => x.Remarks).NotEmpty().WithMessage("Remarks cannot be empty.");
    }
}
