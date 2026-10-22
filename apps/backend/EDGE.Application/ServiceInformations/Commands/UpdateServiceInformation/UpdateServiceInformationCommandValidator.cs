using FluentValidation;

namespace EDGE.Application.ServiceInformations.Commands.UpdateServiceInformation;

public class UpdateServiceInformationCommandValidator : AbstractValidator<UpdateServiceInformationCommand>
{
    public UpdateServiceInformationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.");

        RuleFor(x => x.Information)
            .NotEmpty().WithMessage("Information is required.");

        RuleFor(x => x.WhoMayAvail)
            .NotEmpty().WithMessage("WhoMayAvail is required.");
    }
}
