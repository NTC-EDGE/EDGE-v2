using System;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.ToggleArchiveApplication;

public class ToggleArchiveApplicationCommandValidator : AbstractValidator<ToggleArchiveApplicationCommand>
{
    public ToggleArchiveApplicationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Application ID is required.");
    }
}
