using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IRolePermissionRepository
{
    Task AddAsync(RolePermission rolePermission, CancellationToken cancellationToken = default);
    void Delete(RolePermission rolePermission);
    Task<RolePermission?> GetAsync(Guid roleId, Guid permissionId, CancellationToken cancellationToken = default);
    Task<List<Permission>> GetAllPermissionsAsync(CancellationToken cancellationToken = default);
}
