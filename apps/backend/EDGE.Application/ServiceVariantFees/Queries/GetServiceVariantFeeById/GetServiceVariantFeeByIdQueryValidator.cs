using FluentValidation;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFeeById;

public class GetServiceVariantFeeByIdQueryValidator : AbstractValidator<GetServiceVariantFeeByIdQuery>
{
    public GetServiceVariantFeeByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
