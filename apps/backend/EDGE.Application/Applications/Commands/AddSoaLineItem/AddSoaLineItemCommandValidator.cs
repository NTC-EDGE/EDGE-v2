using FluentValidation;

namespace EDGE.Application.Applications.Commands.AddSoaLineItem;

public class AddSoaLineItemCommandValidator : AbstractValidator<AddSoaLineItemCommand>
{
    public AddSoaLineItemCommandValidator()
    {
        RuleFor(x => x.SoaId)
            .NotEmpty().WithMessage("SoaId is required.");

        RuleFor(x => x.Particular)
            .NotEmpty().WithMessage("Particular is required.")
            .MaximumLength(200).WithMessage("Particular cannot exceed 200 characters.");

        RuleFor(x => x.ItemCode)
            .NotEmpty().WithMessage("ItemCode is required.")
            .MaximumLength(100).WithMessage("ItemCode cannot exceed 100 characters.");

        RuleFor(x => x.NoOfUnits)
            .GreaterThan(0).WithMessage("NoOfUnits must be greater than zero.");

        RuleFor(x => x.FeeRate)
            .GreaterThanOrEqualTo(0).WithMessage("FeeRate cannot be negative.");

        RuleFor(x => x.ValidityYears)
            .GreaterThanOrEqualTo(0).WithMessage("ValidityYears cannot be negative.");
    }
}
