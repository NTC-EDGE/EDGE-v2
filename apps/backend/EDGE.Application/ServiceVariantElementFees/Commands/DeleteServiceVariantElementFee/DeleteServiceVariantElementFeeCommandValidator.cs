using FluentValidation;

namespace EDGE.Application.ServiceVariantElementFees.Commands.DeleteServiceVariantElementFee;

public class DeleteServiceVariantElementFeeCommandValidator : AbstractValidator<DeleteServiceVariantElementFeeCommand>
{
    public DeleteServiceVariantElementFeeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
