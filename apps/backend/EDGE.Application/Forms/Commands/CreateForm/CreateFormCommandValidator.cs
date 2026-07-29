using FluentValidation;

namespace EDGE.Application.Forms.Commands.CreateForm;

public class CreateFormCommandValidator : AbstractValidator<CreateFormCommand>
{
    public CreateFormCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.");

        RuleFor(x => x.Version)
            .NotEmpty().WithMessage("Version is required.")
            .MaximumLength(20).WithMessage("Version cannot exceed 20 characters.");
    }
}
