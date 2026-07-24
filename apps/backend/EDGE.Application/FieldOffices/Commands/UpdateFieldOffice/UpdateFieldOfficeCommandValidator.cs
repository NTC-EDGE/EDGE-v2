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
            .MustAsync(async (model, code, token) => await _repository.IsCodeUniqueAsync(model.TenantId, code, model.Id, token))
            .WithMessage("Field office code must be unique within the tenant.");

        RuleFor(v => v.RegionId)
            .NotEmpty().WithMessage("RegionId is required.");

        RuleFor(v => v.Address)
            .NotEmpty().WithMessage("Address is required.");

        RuleFor(v => v.ContactPhone)
            .NotEmpty().WithMessage("Contact phone is required.");

        RuleFor(v => v.ContactEmail)
            .NotEmpty().WithMessage("Contact email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(v => v.OfficerInChargeId)
            .NotEmpty().WithMessage("Officer in charge ID is required.");
    }
}
