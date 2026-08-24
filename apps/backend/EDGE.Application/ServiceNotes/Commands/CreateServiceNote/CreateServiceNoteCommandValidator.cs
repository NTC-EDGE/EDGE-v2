using FluentValidation;

namespace EDGE.Application.ServiceNotes.Commands.CreateServiceNote;

public class CreateServiceNoteCommandValidator : AbstractValidator<CreateServiceNoteCommand>
{
    public CreateServiceNoteCommandValidator()
    {
        RuleFor(x => x.Notes)
            .NotEmpty().WithMessage("Notes text is required.")
            .MaximumLength(2000).WithMessage("Notes text must not exceed 2000 characters.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");
    }
}
