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
        if (request.TenantId.HasValue)
        {
            return await _roleRepository.GetAllByTenantAsync(request.TenantId.Value, cancellationToken);
        }

        return await _roleRepository.GetAllAsync(cancellationToken);
    }
}
