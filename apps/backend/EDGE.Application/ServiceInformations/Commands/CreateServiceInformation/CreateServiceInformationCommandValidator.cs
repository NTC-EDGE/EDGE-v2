using FluentValidation;

namespace EDGE.Application.ServiceInformations.Commands.CreateServiceInformation;

public class CreateServiceInformationCommandValidator : AbstractValidator<CreateServiceInformationCommand>
{
    public CreateServiceInformationCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("ServiceId is required.");

        RuleFor(x => x.Information)
            .NotEmpty().WithMessage("Information is required.");

        RuleFor(x => x.WhoMayAvail)
            .NotEmpty().WithMessage("WhoMayAvail is required.");
    }
}
