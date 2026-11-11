using FluentValidation;

namespace EDGE.Application.Forms.Queries.GetFormByVariantId;

public class GetFormByVariantIdQueryValidator : AbstractValidator<GetFormByVariantIdQuery>
{
    public GetFormByVariantIdQueryValidator()
    {
        RuleFor(x => x.VariantId)
            .NotEmpty().WithMessage("VariantId is required.");
    }
}
