using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceCategoryRepository
{
    Task<ServiceCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceCategory>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ServiceCategory category, CancellationToken cancellationToken = default);
    void Delete(ServiceCategory category);
}
