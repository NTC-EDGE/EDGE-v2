using FluentValidation;

namespace EDGE.Application.Applications.Commands.ReturnSoa;

public class ReturnSoaCommandValidator : AbstractValidator<ReturnSoaCommand>
{
    public ReturnSoaCommandValidator()
    {
        RuleFor(x => x)
            .Must(x => (x.SoaId.HasValue && x.SoaId.Value != Guid.Empty) ||
                       (x.ApplicationId.HasValue && x.ApplicationId.Value != Guid.Empty))
            .WithMessage("Either SoaId or ApplicationId is required.");
        RuleFor(x => x.Remarks).NotEmpty().WithMessage("Remarks cannot be empty.");
    }
}
