using System;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.ApproveSoa;

public class ApproveSoaCommandValidator : AbstractValidator<ApproveSoaCommand>
{
    public ApproveSoaCommandValidator()
    {
        RuleFor(x => x)
            .Must(x => (x.SoaId.HasValue && x.SoaId.Value != Guid.Empty) ||
                       (x.ApplicationId.HasValue && x.ApplicationId.Value != Guid.Empty))
            .WithMessage("Either SoaId or ApplicationId is required.");
    }
}
