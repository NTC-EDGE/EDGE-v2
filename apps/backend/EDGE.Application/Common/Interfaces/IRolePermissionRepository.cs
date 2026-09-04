using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IRolePermissionRepository
{
    Task AddAsync(RolePermission rolePermission, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<RolePermission> rolePermissions, CancellationToken cancellationToken = default);
    void Delete(RolePermission rolePermission);
    Task<RolePermission?> GetAsync(Guid roleId, string permissionKey, CancellationToken cancellationToken = default);
    Task<RolePermission?> GetAsync(Guid roleId, string permissionKey, bool includeDeleted, CancellationToken cancellationToken = default);
    Task<List<string>> GetPermissionKeysForRoleAsync(Guid roleId, CancellationToken cancellationToken = default);
}
