using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceRepository
{
    Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Service>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<Service>> GetByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task AddAsync(Service service, CancellationToken cancellationToken = default);
    void Delete(Service service);
}
