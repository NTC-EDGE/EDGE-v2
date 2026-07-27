using FluentValidation;

namespace EDGE.Application.ServiceFees.Commands.DeleteServiceFee;

public class DeleteServiceFeeCommandValidator : AbstractValidator<DeleteServiceFeeCommand>
{
    public DeleteServiceFeeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Service Fee ID is required.");
    }
}
