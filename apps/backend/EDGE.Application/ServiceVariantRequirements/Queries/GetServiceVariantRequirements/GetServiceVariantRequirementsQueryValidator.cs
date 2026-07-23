using FluentValidation;

namespace EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirements;

public class GetServiceVariantRequirementsQueryValidator : AbstractValidator<GetServiceVariantRequirementsQuery>
{
    public GetServiceVariantRequirementsQueryValidator()
    {
        RuleFor(x => x.ServiceVariantId)
            .NotEmpty().WithMessage("Service Variant ID is required.");
    }
}
