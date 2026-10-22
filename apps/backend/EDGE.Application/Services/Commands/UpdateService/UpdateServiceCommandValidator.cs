using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Services.Commands.UpdateService;

public class UpdateServiceCommandValidator : AbstractValidator<UpdateServiceCommand>
{
    public UpdateServiceCommandValidator(IServiceRepository repository)
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Service ID is required.");

        RuleFor(x => x.ServiceCategoryId)
            .NotEmpty().WithMessage("Service Category is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service Name is required.")
            .MaximumLength(500).WithMessage("Service Name must not exceed 500 characters.");

        RuleFor(x => x.Code)
            .MaximumLength(50).WithMessage("Service Code must not exceed 50 characters.")
            .MustAsync(async (cmd, code, token) => await repository.IsCodeUniqueAsync(code!, cmd.Id, token))
            .When(x => !string.IsNullOrWhiteSpace(x.Code))
            .WithMessage("Service Code must be unique.");
    }
}
