using FluentValidation;

namespace EDGE.Application.ServiceFees.Commands.CreateServiceFee;

public class CreateServiceFeeCommandValidator : AbstractValidator<CreateServiceFeeCommand>
{
    public CreateServiceFeeCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");

        RuleFor(x => x.Fees)
            .NotEmpty().WithMessage("Fees list is required and cannot be empty.");

        RuleForEach(x => x.Fees).ChildRules(fee =>
        {
            fee.RuleFor(f => f.FeeId)
                .NotEmpty().WithMessage("Fee ID is required.");

            fee.RuleFor(f => f.Amount)
                .GreaterThanOrEqualTo(0).WithMessage("Amount must be greater than or equal to 0.");
        });
    }
}
