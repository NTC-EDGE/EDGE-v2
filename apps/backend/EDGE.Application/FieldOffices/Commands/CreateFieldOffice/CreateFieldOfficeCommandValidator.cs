using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public class CreateFieldOfficeCommandValidator : AbstractValidator<CreateFieldOfficeCommand>
{
    public CreateFieldOfficeCommandValidator(IFieldOfficeRepository repository)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(v => v.RegionId)
            .NotEmpty().WithMessage("Region is required.");

        When(v => !string.IsNullOrWhiteSpace(v.Code), () =>
        {
            RuleFor(v => v.Code)
                .MaximumLength(20).WithMessage("Code must not exceed 20 characters.")
                .MustAsync(async (code, cancellationToken) => await repository.IsCodeUniqueAsync(code!, null, cancellationToken))
                .WithMessage("Code must be unique.");
        });
    }
}
