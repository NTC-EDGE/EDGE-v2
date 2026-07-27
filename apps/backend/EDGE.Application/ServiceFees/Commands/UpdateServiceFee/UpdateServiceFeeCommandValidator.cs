using FluentValidation;

namespace EDGE.Application.ServiceFees.Commands.UpdateServiceFee;

public class UpdateServiceFeeCommandValidator : AbstractValidator<UpdateServiceFeeCommand>
{
    public UpdateServiceFeeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Service Fee ID is required.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");

        RuleFor(x => x.FeeId)
            .NotEmpty().WithMessage("Fee ID is required.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("Amount must be greater than or equal to 0.");
    }
}
