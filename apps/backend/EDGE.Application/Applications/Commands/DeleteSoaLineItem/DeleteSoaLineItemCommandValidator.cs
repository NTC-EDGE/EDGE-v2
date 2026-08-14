using FluentValidation;

namespace EDGE.Application.Applications.Commands.DeleteSoaLineItem;

public class DeleteSoaLineItemCommandValidator : AbstractValidator<DeleteSoaLineItemCommand>
{
    public DeleteSoaLineItemCommandValidator()
    {
        RuleFor(x => x.SoaId)
            .NotEmpty().WithMessage("SoaId is required.");

        RuleFor(x => x.LineItemId)
            .NotEmpty().WithMessage("LineItemId is required.");
    }
}
