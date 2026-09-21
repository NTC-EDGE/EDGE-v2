using System;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.CreateSoa;

public class CreateSoaCommandValidator : AbstractValidator<CreateSoaCommand>
{
    public CreateSoaCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty().WithMessage("ApplicationId is required.");
    }
}
