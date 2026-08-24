using FluentValidation;

namespace EDGE.Application.Forms.Commands.DeleteForm;

public class DeleteFormCommandValidator : AbstractValidator<DeleteFormCommand>
{
    public DeleteFormCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Form Id is required.");
    }
}
