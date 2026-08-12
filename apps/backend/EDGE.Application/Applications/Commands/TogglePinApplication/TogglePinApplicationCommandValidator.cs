using System;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.TogglePinApplication;

public class TogglePinApplicationCommandValidator : AbstractValidator<TogglePinApplicationCommand>
{
    public TogglePinApplicationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Application ID is required.");
    }
}
