using FluentValidation;

namespace EDGE.Application.SystemConfigs.Commands.UpdateSystemConfig;

public class UpdateSystemConfigCommandValidator : AbstractValidator<UpdateSystemConfigCommand>
{
    public UpdateSystemConfigCommandValidator()
    {
        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Config key is required.")
            .MaximumLength(100).WithMessage("Key cannot exceed 100 characters.");

        RuleFor(x => x.Value)
            .NotNull().WithMessage("Config value cannot be null.");
    }
}
