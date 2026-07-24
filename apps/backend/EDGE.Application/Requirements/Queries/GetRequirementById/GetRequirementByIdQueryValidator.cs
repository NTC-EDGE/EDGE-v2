using FluentValidation;

namespace EDGE.Application.Requirements.Queries.GetRequirementById;

public class GetRequirementByIdQueryValidator : AbstractValidator<GetRequirementByIdQuery>
{
    public GetRequirementByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");
    }
}
