using FluentValidation;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficesByTenant;

public class GetFieldOfficesByTenantQueryValidator : AbstractValidator<GetFieldOfficesByTenantQuery>
{
    public GetFieldOfficesByTenantQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");
    }
}
