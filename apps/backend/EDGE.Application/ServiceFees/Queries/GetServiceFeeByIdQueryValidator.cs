using FluentValidation;

namespace EDGE.Application.ServiceFees.Queries;

public class GetServiceFeeByIdQueryValidator : AbstractValidator<GetServiceFeeByIdQuery>
{
    public GetServiceFeeByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Service Fee ID is required.");
    }
}
