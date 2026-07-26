using FluentValidation;

namespace EDGE.Application.Fees.Queries;

public class GetFeeByIdQueryValidator : AbstractValidator<GetFeeByIdQuery>
{
    public GetFeeByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Fee ID is required.");
    }
}
