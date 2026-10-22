using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Roles.Commands;

public class DuplicateRoleCommandHandler : IRequestHandler<DuplicateRoleCommand, Role>
{
    private readonly IRoleRepository _roleRepository;
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public DuplicateRoleCommandHandler(
        IRoleRepository roleRepository,
        IRolePermissionRepository rolePermissionRepository,
        ITenantRepository tenantRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _roleRepository = roleRepository;
        _rolePermissionRepository = rolePermissionRepository;
        _tenantRepository = tenantRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Role> Handle(DuplicateRoleCommand request, CancellationToken cancellationToken)
    {
        var sourceRole = await _roleRepository.GetByIdAsync(request.SourceRoleId, cancellationToken);
        if (sourceRole == null)
        {
            throw new InvalidOperationException($"Source role '{request.SourceRoleId}' not found.");
        }

        var targetTenant = await _tenantRepository.GetByIdAsync(request.TargetTenantId, cancellationToken);
        if (targetTenant == null)
        {
            throw new InvalidOperationException($"Target tenant '{request.TargetTenantId}' not found.");
        }

        await _tenantContextService.EnsureUserActiveMemberAsync(
            request.TargetTenantId,
            "You are only authorized to duplicate roles into your own regional tenant.",
            cancellationToken);

        var isUnique = await _roleRepository.IsRoleNameUniqueAsync(request.Name, request.TargetTenantId, null, cancellationToken);
        if (!isUnique)
        {
            throw new InvalidOperationException($"A role with the name '{request.Name}' already exists in this tenant or as a standard role.");
        }

        var newRole = new Role
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Key = request.Key,
            Description = request.Description ?? sourceRole.Description,
            TenantId = request.TargetTenantId,
            IsSystemRole = false,
            CreatedAt = DateTime.UtcNow
        };

        await _roleRepository.AddAsync(newRole, cancellationToken);

        // Copy all permission assignments from source role
        var sourcePermissions = await _rolePermissionRepository.GetPermissionKeysForRoleAsync(request.SourceRoleId, cancellationToken);
        if (sourcePermissions != null && sourcePermissions.Count > 0)
        {
            var rolePermissions = sourcePermissions.Select(permKey => new RolePermission
            {
                Id = Guid.NewGuid(),
                RoleId = newRole.Id,
                PermissionKey = permKey,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _rolePermissionRepository.AddRangeAsync(rolePermissions, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return newRole;
    }
}
