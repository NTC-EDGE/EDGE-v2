using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Role role, CancellationToken cancellationToken = default);
    Task<List<Role>> GetAllAsync(CancellationToken cancellationToken = default);
}
