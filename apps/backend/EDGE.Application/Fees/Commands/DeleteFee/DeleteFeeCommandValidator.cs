using FluentValidation;

namespace EDGE.Application.Fees.Commands.DeleteFee;

public class DeleteFeeCommandValidator : AbstractValidator<DeleteFeeCommand>
{
    public DeleteFeeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Fee ID is required.");
    }
}
