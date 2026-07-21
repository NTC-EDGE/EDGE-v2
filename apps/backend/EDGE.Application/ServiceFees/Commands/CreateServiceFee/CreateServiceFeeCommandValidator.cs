using FluentValidation;

namespace EDGE.Application.ServiceFees.Commands.CreateServiceFee;

public class CreateServiceFeeCommandValidator : AbstractValidator<CreateServiceFeeCommand>
{
    public CreateServiceFeeCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");

        RuleFor(x => x.FeeId)
            .NotEmpty().WithMessage("Fee ID is required.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("Amount must be greater than or equal to 0.");
    }
}
