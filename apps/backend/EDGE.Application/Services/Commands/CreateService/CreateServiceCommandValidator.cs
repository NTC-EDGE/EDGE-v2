using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Services.Commands.CreateService;

public class CreateServiceCommandValidator : AbstractValidator<CreateServiceCommand>
{
    public CreateServiceCommandValidator(IServiceRepository repository)
    {
        RuleFor(x => x.ServiceCategoryId)
            .NotEmpty().WithMessage("Service Category is required.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service Name is required.")
            .MaximumLength(500).WithMessage("Service Name must not exceed 500 characters.");

        RuleFor(x => x.Code)
            .MaximumLength(50).WithMessage("Service Code must not exceed 50 characters.")
            .MustAsync(async (code, token) => await repository.IsCodeUniqueAsync(code!, null, token))
            .When(x => !string.IsNullOrWhiteSpace(x.Code))
            .WithMessage("Service Code must be unique.");
    }
}
