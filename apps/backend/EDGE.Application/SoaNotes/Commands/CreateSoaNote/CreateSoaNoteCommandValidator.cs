using FluentValidation;

namespace EDGE.Application.SoaNotes.Commands.CreateSoaNote;

public class CreateSoaNoteCommandValidator : AbstractValidator<CreateSoaNoteCommand>
{
    public CreateSoaNoteCommandValidator()
    {
        RuleFor(x => x.Notes)
            .NotEmpty().WithMessage("Notes text is required.")
            .MaximumLength(4000).WithMessage("Notes text must not exceed 4000 characters.");

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Code)
            .MaximumLength(50).WithMessage("Code must not exceed 50 characters.");
    }
}
