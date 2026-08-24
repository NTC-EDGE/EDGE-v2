using FluentValidation;

namespace EDGE.Application.Forms.Commands.DuplicateForm;

public class DuplicateFormCommandValidator : AbstractValidator<DuplicateFormCommand>
{
    public DuplicateFormCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Source Form Id is required.");
    }
}
