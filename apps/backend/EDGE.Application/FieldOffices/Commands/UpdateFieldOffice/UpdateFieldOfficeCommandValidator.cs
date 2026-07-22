using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public class UpdateFieldOfficeCommandValidator : AbstractValidator<UpdateFieldOfficeCommand>
{
    public UpdateFieldOfficeCommandValidator(IFieldOfficeRepository repository)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(v => v.RegionId)
            .NotEmpty().WithMessage("Region is required.");

        When(v => !string.IsNullOrWhiteSpace(v.Code), () =>
        {
            RuleFor(v => v.Code)
                .MaximumLength(20).WithMessage("Code must not exceed 20 characters.")
                .MustAsync(async (command, code, cancellationToken) => await repository.IsCodeUniqueAsync(code!, command.Id, cancellationToken))
                .WithMessage("Code must be unique.");
        });
    }
}
