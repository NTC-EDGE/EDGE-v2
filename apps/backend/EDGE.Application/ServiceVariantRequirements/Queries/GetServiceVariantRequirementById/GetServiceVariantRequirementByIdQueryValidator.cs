using FluentValidation;

namespace EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirementById;

public class GetServiceVariantRequirementByIdQueryValidator : AbstractValidator<GetServiceVariantRequirementByIdQuery>
{
    public GetServiceVariantRequirementByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");
    }
}
