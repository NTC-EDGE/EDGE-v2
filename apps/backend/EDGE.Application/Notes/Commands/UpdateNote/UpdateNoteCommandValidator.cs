using FluentValidation;

namespace EDGE.Application.Notes.Commands.UpdateNote;

public class UpdateNoteCommandValidator : AbstractValidator<UpdateNoteCommand>
{
    public UpdateNoteCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Note ID is required.");

        RuleFor(x => x.Notes)
            .NotEmpty().WithMessage("Notes text is required.")
            .MaximumLength(2000).WithMessage("Notes text must not exceed 2000 characters.");

        RuleFor(x => x.ServiceCategoryId)
            .NotEmpty().WithMessage("Service Category ID is required.");
    }
}
