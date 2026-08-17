using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Role>> GetAllByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<Role>> GetSystemRolesAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Role role, CancellationToken cancellationToken = default);
    Task<List<Role>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<bool> IsRoleNameUniqueAsync(string name, Guid? tenantId = null, Guid? excludeId = null, CancellationToken cancellationToken = default);
    void Delete(Role role);
}
