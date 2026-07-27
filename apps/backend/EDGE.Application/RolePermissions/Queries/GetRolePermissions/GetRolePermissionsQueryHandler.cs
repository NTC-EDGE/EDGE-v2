using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.RolePermissions.Queries.GetRolePermissions;

public class GetRolePermissionsQueryHandler : IRequestHandler<GetRolePermissionsQuery, List<string>>
{
    private readonly IRolePermissionRepository _repository;

    public GetRolePermissionsQueryHandler(IRolePermissionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<string>> Handle(GetRolePermissionsQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetPermissionKeysForRoleAsync(request.RoleId, cancellationToken);
    }
}
