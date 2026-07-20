using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Queries;

public class GetApplicationQueryHandler : IRequestHandler<GetApplicationQuery, ApplicationRecord?>
{
    private readonly IApplicationRepository _repository;

    public GetApplicationQueryHandler(IApplicationRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApplicationRecord?> Handle(GetApplicationQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(request.Id, cancellationToken);
    }
}
