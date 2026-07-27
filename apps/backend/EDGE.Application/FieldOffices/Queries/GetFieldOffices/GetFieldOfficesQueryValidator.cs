using FluentValidation;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOffices;

public class GetFieldOfficesQueryValidator : AbstractValidator<GetFieldOfficesQuery>
{
    public GetFieldOfficesQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");
    }
}
