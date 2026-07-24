using FluentValidation;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;

public class GetFieldOfficeByIdQueryValidator : AbstractValidator<GetFieldOfficeByIdQuery>
{
    public GetFieldOfficeByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");
    }
}
