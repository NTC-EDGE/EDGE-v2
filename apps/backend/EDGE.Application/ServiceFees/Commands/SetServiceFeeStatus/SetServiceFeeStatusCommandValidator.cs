using FluentValidation;

namespace EDGE.Application.ServiceFees.Commands.SetServiceFeeStatus;

public class SetServiceFeeStatusCommandValidator : AbstractValidator<SetServiceFeeStatusCommand>
{
    public SetServiceFeeStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Service Fee ID is required.");
    }
}
