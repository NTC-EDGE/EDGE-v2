using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.RolePermissions.Commands;

public class RevokePermissionCommandHandler : IRequestHandler<RevokePermissionCommand, bool>
{
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public RevokePermissionCommandHandler(
        IRolePermissionRepository rolePermissionRepository,
        IRoleRepository roleRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _rolePermissionRepository = rolePermissionRepository;
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RevokePermissionCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null) return false;

        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);

        // 1. Standard / System roles cannot be modified by tenant administrators
        if (role.TenantId == null || role.IsSystemRole)
        {
            if (!isSuperAdmin)
            {
                throw new UnauthorizedAccessException("Standard system roles cannot be modified by tenant administrators. Please duplicate or create a custom role for your tenant.");
            }
        }
        else
        {
            // 2. Tenant admin can only modify custom roles belonging to their own tenant
            await _tenantContextService.EnsureUserActiveMemberAsync(
                role.TenantId.Value,
                "You are only authorized to revoke permissions from roles belonging to your own regional tenant.",
                cancellationToken);
        }

        var existing = await _rolePermissionRepository.GetAsync(request.RoleId, request.PermissionKey, cancellationToken);
        if (existing == null) return false;

        _rolePermissionRepository.Delete(existing);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
