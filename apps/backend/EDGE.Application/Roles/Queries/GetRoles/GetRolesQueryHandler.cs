using System.Linq;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Queries;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, List<Role>>
{
    private readonly IRoleRepository _roleRepository;

    public GetRolesQueryHandler(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    public async Task<List<Role>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        List<Role> roles;
        if (request.TenantId.HasValue)
        {
            roles = await _roleRepository.GetAllByTenantAsync(request.TenantId.Value, cancellationToken);
        }
        else
        {
            roles = await _roleRepository.GetAllAsync(cancellationToken);
        }

        if (!request.IncludeSystemRoles)
        {
            roles = roles.Where(r => !r.IsSystemRole && !r.Name.ToLower().Contains("super admin")).ToList();
        }

        return roles;
    }
}
