using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public class UpdateFieldOfficeCommandValidator : AbstractValidator<UpdateFieldOfficeCommand>
{
    private readonly IFieldOfficeRepository _repository;

    public UpdateFieldOfficeCommandValidator(IFieldOfficeRepository repository)
    {
        _repository = repository;

        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");

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
                return await _repository.IsCodeUniqueAsync(tenantId, code, model.Id, token);
            })
            .WithMessage("Field office code must be unique within the tenant.");
    }
}
