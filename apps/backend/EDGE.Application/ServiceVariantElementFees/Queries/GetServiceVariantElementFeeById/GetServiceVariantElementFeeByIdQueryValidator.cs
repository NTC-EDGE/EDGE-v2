using FluentValidation;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFeeById;

public class GetServiceVariantElementFeeByIdQueryValidator : AbstractValidator<GetServiceVariantElementFeeByIdQuery>
{
    public GetServiceVariantElementFeeByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
