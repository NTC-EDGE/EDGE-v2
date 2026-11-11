using FluentValidation;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.ReturnOp;

public class ReturnOpCommandValidator : AbstractValidator<ReturnOpCommand>
{
    public ReturnOpCommandValidator()
    {
        RuleFor(x => x.Remarks).NotEmpty().WithMessage("Remarks cannot be empty.");
        RuleFor(x => x.ReturnTo).IsInEnum().WithMessage("ReturnTo must be a valid ReturnTarget (Accountant, Evaluator, or Supervisor).");
    }
}
