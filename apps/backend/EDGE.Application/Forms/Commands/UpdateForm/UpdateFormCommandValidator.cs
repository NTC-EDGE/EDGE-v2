using FluentValidation;

namespace EDGE.Application.Forms.Commands.UpdateForm;

public class UpdateFormCommandValidator : AbstractValidator<UpdateFormCommand>
{
    public UpdateFormCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Form Id is required.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.");

        RuleFor(x => x.Version)
            .NotEmpty().WithMessage("Version is required.")
            .MaximumLength(20).WithMessage("Version cannot exceed 20 characters.");
    }
}
