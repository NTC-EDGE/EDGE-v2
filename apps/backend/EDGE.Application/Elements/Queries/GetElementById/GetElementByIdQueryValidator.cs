using FluentValidation;

namespace EDGE.Application.Elements.Queries.GetElementById;

public class GetElementByIdQueryValidator : AbstractValidator<GetElementByIdQuery>
{
    public GetElementByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
