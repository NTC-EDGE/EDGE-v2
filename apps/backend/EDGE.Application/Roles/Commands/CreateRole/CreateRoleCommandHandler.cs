using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Role>
{
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRoleCommandHandler(
        IRoleRepository roleRepository,
        ITenantRepository tenantRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _tenantRepository = tenantRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Role> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);

        if (request.IsSystemRole && !isSuperAdmin)
        {
            throw new UnauthorizedAccessException("Only Super Administrators can create system roles.");
        }

        if (!request.TenantId.HasValue)
        {
            if (!isSuperAdmin)
            {
                throw new UnauthorizedAccessException("Tenant administrators cannot create standard or global roles without a tenant scope.");
            }
        }
        else
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.TenantId.Value, cancellationToken);
            if (tenant == null)
            {
                throw new InvalidOperationException($"Tenant '{request.TenantId.Value}' not found.");
            }

            await _tenantContextService.EnsureUserActiveMemberAsync(
                request.TenantId.Value,
                "You are only authorized to create roles for your own regional tenant.",
                cancellationToken);
        }

        var isUnique = await _roleRepository.IsRoleNameUniqueAsync(request.Name, request.TenantId, null, cancellationToken);
        if (!isUnique)
        {
            throw new InvalidOperationException($"A role with the name '{request.Name}' already exists in this tenant or as a standard role.");
        }

        var role = new Role
        {
            Name = request.Name,
            Key = request.Key,
            Description = request.Description,
            TenantId = request.TenantId,
            IsSystemRole = request.IsSystemRole
        };

        await _roleRepository.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return role;
    }
}
