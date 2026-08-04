using FluentValidation;

namespace EDGE.Application.ServiceVariantFees.Commands.UpdateServiceVariantFee;

public class UpdateServiceVariantFeeCommandValidator : AbstractValidator<UpdateServiceVariantFeeCommand>
{
    public UpdateServiceVariantFeeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariantId is required.");

        RuleFor(x => x.FeeId)
            .NotEmpty().WithMessage("FeeId is required.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("Amount must be greater than or equal to 0.");
    }
}
