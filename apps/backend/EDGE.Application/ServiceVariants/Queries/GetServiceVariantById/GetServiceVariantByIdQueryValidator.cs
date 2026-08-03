using FluentValidation;

namespace EDGE.Application.ServiceVariants.Queries.GetServiceVariantById;

public class GetServiceVariantByIdQueryValidator : AbstractValidator<GetServiceVariantByIdQuery>
{
    public GetServiceVariantByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
