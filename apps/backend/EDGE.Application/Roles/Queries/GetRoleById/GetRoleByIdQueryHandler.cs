using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Queries;

public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, Role?>
{
    private readonly IRoleRepository _roleRepository;

    public GetRoleByIdQueryHandler(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    public async Task<Role?> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        return await _roleRepository.GetByIdAsync(request.Id, cancellationToken);
    }
}
