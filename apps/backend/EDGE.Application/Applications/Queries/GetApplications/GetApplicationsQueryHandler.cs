using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Queries;

public class GetApplicationsQueryHandler : IRequestHandler<GetApplicationsQuery, List<ApplicationRecord>>
{
    private readonly IApplicationRepository _repository;

    public GetApplicationsQueryHandler(IApplicationRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ApplicationRecord>> Handle(GetApplicationsQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetAllAsync(cancellationToken);
    }
}
