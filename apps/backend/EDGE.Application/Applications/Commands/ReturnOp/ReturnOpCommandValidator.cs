using FluentValidation;

namespace EDGE.Application.Applications.Commands.ReturnOp;

public class ReturnOpCommandValidator : AbstractValidator<ReturnOpCommand>
{
    public ReturnOpCommandValidator()
    {
        RuleFor(x => x.Remarks).NotEmpty().WithMessage("Remarks cannot be empty.");
        RuleFor(x => x.ReturnTo).Must(r => r == "Accountant" || r == "Evaluator").WithMessage("ReturnTo must be Accountant or Evaluator.");
    }
}
