using FluentValidation;

namespace EDGE.Application.Elements.Commands.DeleteElement;

public class DeleteElementCommandValidator : AbstractValidator<DeleteElementCommand>
{
    public DeleteElementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
