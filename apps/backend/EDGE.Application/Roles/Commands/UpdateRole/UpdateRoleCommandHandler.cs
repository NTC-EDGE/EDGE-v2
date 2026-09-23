using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, Role?>
{
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoleCommandHandler(
        IRoleRepository roleRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Role?> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (role == null) return null;

        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);

        // 1. Standard / System roles cannot be renamed or updated by tenant administrators
        if (role.TenantId == null || role.IsSystemRole)
        {
            if (!isSuperAdmin)
            {
                throw new UnauthorizedAccessException("Standard system roles cannot be modified by tenant administrators.");
            }
        }
        else
        {
            // 2. Tenant admin can only update custom roles belonging to their own tenant
            await _tenantContextService.EnsureUserActiveMemberAsync(
                role.TenantId.Value,
                "You are only authorized to update roles belonging to your own regional tenant.",
                cancellationToken);
        }

        var isUnique = await _roleRepository.IsRoleNameUniqueAsync(request.Name, role.TenantId, request.Id, cancellationToken);
        if (!isUnique)
        {
            throw new InvalidOperationException($"A role with the name '{request.Name}' already exists in this tenant or as a standard role.");
        }

        role.Name = request.Name;
        role.Key = request.Key;
        role.Description = request.Description;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return role;
    }
}
