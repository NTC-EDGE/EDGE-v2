using FluentValidation;

namespace EDGE.Application.Notes.Commands.CreateNote;

public class CreateNoteCommandValidator : AbstractValidator<CreateNoteCommand>
{
    public CreateNoteCommandValidator()
    {
        RuleFor(x => x.Notes)
            .NotEmpty().WithMessage("Notes text is required.")
            .MaximumLength(2000).WithMessage("Notes text must not exceed 2000 characters.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Service ID cannot be an empty Guid.");

        RuleFor(x => x.ServiceVariantId)
            .NotEqual(Guid.Empty).When(x => x.ServiceVariantId.HasValue)
            .WithMessage("Service Variant ID cannot be an empty Guid.");
    }
}
