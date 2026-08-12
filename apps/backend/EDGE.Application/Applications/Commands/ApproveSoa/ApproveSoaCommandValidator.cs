using System;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.ApproveSoa;

public class ApproveSoaCommandValidator : AbstractValidator<ApproveSoaCommand>
{
    public ApproveSoaCommandValidator()
    {
        RuleFor(x => x.SoaId)
            .NotEmpty().WithMessage("SOA ID is required.");
    }
}
