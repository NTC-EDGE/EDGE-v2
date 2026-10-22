using System.Linq;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Queries;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, List<Role>>
{
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantContextService _tenantContextService;

    public GetRolesQueryHandler(IRoleRepository roleRepository, ITenantContextService tenantContextService)
    {
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
    }

    public async Task<List<Role>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);

        List<Role> roles;
        if (request.TenantId.HasValue)
        {
            if (!isSuperAdmin)
            {
                await _tenantContextService.EnsureUserActiveMemberAsync(
                    request.TenantId.Value,
                    "You are not authorized to view roles for another tenant.",
                    cancellationToken);
            }
            roles = await _roleRepository.GetAllByTenantAsync(request.TenantId.Value, cancellationToken);
        }
        else if (isSuperAdmin)
        {
            roles = await _roleRepository.GetAllAsync(cancellationToken);
        }
        else
        {
            var userTenantIds = await _tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
            var allRoles = await _roleRepository.GetAllAsync(cancellationToken);
            roles = allRoles.Where(r => r.TenantId == null || userTenantIds.Contains(r.TenantId.Value)).ToList();
        }

        if (!request.IncludeSystemRoles)
        {
            roles = roles.Where(r => !r.IsSystemRole && !r.Name.ToLower().Contains("super admin")).ToList();
        }

        return roles;
    }
}
