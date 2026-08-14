using FluentValidation;

namespace EDGE.Application.ServiceNotes.Commands.UpdateServiceNote;

public class UpdateServiceNoteCommandValidator : AbstractValidator<UpdateServiceNoteCommand>
{
    public UpdateServiceNoteCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");

        RuleFor(x => x.Notes)
            .NotEmpty().WithMessage("Notes text is required.")
            .MaximumLength(2000).WithMessage("Notes text must not exceed 2000 characters.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");
    }
}
