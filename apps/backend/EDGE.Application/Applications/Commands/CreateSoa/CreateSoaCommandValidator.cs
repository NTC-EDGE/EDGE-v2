using System;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.CreateSoa;

public class CreateSoaCommandValidator : AbstractValidator<CreateSoaCommand>
{
    public CreateSoaCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty().WithMessage("ApplicationId is required.");
        RuleFor(x => x.IssuedToName).NotEmpty().WithMessage("IssuedToName is required.");
        RuleFor(x => x.LineItems).NotEmpty().WithMessage("LineItems must have at least 1 item.");
    }
}
