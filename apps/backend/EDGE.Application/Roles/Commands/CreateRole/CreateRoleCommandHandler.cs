using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Role>
{
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRoleCommandHandler(
        IRoleRepository roleRepository,
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Role> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        if (request.TenantId.HasValue)
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.TenantId.Value, cancellationToken);
            if (tenant == null)
            {
                throw new InvalidOperationException($"Tenant '{request.TenantId.Value}' not found.");
            }
        }

        var role = new Role
        {
            Name = request.Name,
            Key = request.Key,
            Description = request.Description,
            TenantId = request.TenantId,
            IsSystemRole = request.TenantId == null
        };

        await _roleRepository.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return role;
    }
}
