using FluentValidation;

namespace EDGE.Application.ServiceFees.Queries;

public class GetServiceFeesQueryValidator : AbstractValidator<GetServiceFeesQuery>
{
    public GetServiceFeesQueryValidator()
    {
    }
}
