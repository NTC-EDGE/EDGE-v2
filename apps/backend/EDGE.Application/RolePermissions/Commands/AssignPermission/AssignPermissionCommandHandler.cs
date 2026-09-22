using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.RolePermissions.Commands;

public class AssignPermissionCommandHandler : IRequestHandler<AssignPermissionCommand, bool>
{
    private readonly IRolePermissionRepository _rolePermissionRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignPermissionCommandHandler(
        IRolePermissionRepository rolePermissionRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork)
    {
        _rolePermissionRepository = rolePermissionRepository;
        _roleRepository = roleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(AssignPermissionCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null) return false;

        if (!Permissions.AllKeys.Contains(request.PermissionKey))
        {
            throw new InvalidOperationException($"Permission key '{request.PermissionKey}' is not a valid system permission.");
        }

        var existing = await _rolePermissionRepository.GetAsync(request.RoleId, request.PermissionKey, includeDeleted: true, cancellationToken);
        if (existing != null)
        {
            if (existing.IsDeleted)
            {
                existing.IsDeleted = false;
                existing.IsDeletedBy = string.Empty;
                existing.LastModifiedAt = DateTime.UtcNow;
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
            return true;
        }

        var rp = new RolePermission
        {
            RoleId = request.RoleId,
            PermissionKey = request.PermissionKey
        };

        await _rolePermissionRepository.AddAsync(rp, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
