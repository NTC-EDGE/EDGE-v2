using FluentValidation;

namespace EDGE.Application.Applications.Commands.VerifyPayment;

public class VerifyPaymentCommandValidator : AbstractValidator<VerifyPaymentCommand>
{
    public VerifyPaymentCommandValidator()
    {
        RuleFor(x => x.OfficialReceiptNumber).NotEmpty().WithMessage("OfficialReceiptNumber is required.");
        RuleFor(x => x.AmountReceived).GreaterThan(0).WithMessage("AmountReceived must be > 0.");
    }
}
