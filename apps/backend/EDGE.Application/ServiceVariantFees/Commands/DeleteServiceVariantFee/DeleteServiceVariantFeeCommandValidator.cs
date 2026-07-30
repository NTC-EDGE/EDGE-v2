using FluentValidation;

namespace EDGE.Application.ServiceVariantFees.Commands.DeleteServiceVariantFee;

public class DeleteServiceVariantFeeCommandValidator : AbstractValidator<DeleteServiceVariantFeeCommand>
{
    public DeleteServiceVariantFeeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
