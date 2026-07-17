using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Permissions.Queries;

public class GetPermissionsQueryHandler : IRequestHandler<GetPermissionsQuery, List<Permission>>
{
    private readonly IRolePermissionRepository _repository;

    public GetPermissionsQueryHandler(IRolePermissionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Permission>> Handle(GetPermissionsQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetAllPermissionsAsync(cancellationToken);
    }
}
