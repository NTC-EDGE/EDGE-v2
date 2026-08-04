using FluentValidation;

namespace EDGE.Application.ServiceVariantElementFees.Commands.CreateServiceVariantElementFee;

public class CreateServiceVariantElementFeeCommandValidator : AbstractValidator<CreateServiceVariantElementFeeCommand>
{
    public CreateServiceVariantElementFeeCommandValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("ServiceVariantId is required.");

        RuleFor(x => x.ElementId)
            .NotEmpty().WithMessage("ElementId is required.");

        RuleFor(x => x.FeeId)
            .NotEmpty().WithMessage("FeeId is required.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("Amount must be greater than or equal to 0.");
    }
}
