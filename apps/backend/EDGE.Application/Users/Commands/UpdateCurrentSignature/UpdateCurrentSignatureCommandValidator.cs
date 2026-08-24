using FluentValidation;

namespace EDGE.Application.Users.Commands.UpdateCurrentSignature;

public class UpdateCurrentSignatureCommandValidator : AbstractValidator<UpdateCurrentSignatureCommand>
{
    public UpdateCurrentSignatureCommandValidator()
    {
        RuleFor(x => x.ESignature)
            .NotEmpty()
            .WithMessage("ESignature data must not be empty.");
    }
}
