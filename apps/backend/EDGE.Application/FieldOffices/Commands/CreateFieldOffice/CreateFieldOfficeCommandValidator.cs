using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public class CreateFieldOfficeCommandValidator : AbstractValidator<CreateFieldOfficeCommand>
{
    private readonly IFieldOfficeRepository _repository;

    public CreateFieldOfficeCommandValidator(IFieldOfficeRepository repository)
    {
        _repository = repository;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(150).WithMessage("Name must not exceed 150 characters.");

        RuleFor(v => v.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(50).WithMessage("Code must not exceed 50 characters.")
            .MustAsync(async (model, code, token) =>
            {
                if (string.IsNullOrWhiteSpace(code)) return true;
                var tenantId = model.TenantId ?? Guid.Empty;
                return await _repository.IsCodeUniqueAsync(tenantId, code, null, token);
            })
            .WithMessage("Field office code must be unique within the tenant.");
    }
}
