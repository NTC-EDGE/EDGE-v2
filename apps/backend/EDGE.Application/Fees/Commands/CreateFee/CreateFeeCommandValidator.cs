using FluentValidation;

namespace EDGE.Application.Fees.Commands.CreateFee;

public class CreateFeeCommandValidator : AbstractValidator<CreateFeeCommand>
{
    public CreateFeeCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Fee Code is required.")
            .MaximumLength(50).WithMessage("Fee Code must not exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Fee Name is required.")
            .MaximumLength(150).WithMessage("Fee Name must not exceed 150 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
