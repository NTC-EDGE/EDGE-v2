using FluentValidation;

namespace EDGE.Application.Fees.Commands.SetFeeStatus;

public class SetFeeStatusCommandValidator : AbstractValidator<SetFeeStatusCommand>
{
    public SetFeeStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Fee ID is required.");
    }
}
