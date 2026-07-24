using FluentValidation;

namespace EDGE.Application.Fees.Queries;

public class GetFeesQueryValidator : AbstractValidator<GetFeesQuery>
{
    public GetFeesQueryValidator()
    {
    }
}
