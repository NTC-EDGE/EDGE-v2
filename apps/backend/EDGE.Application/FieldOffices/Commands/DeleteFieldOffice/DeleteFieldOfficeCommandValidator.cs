using FluentValidation;

namespace EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;

public class DeleteFieldOfficeCommandValidator : AbstractValidator<DeleteFieldOfficeCommand>
{
    public DeleteFieldOfficeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");
    }
}
