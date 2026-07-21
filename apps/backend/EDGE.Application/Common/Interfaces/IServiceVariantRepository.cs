using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceVariantRepository
{
    Task<ServiceVariant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariant>> GetByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task AddAsync(ServiceVariant variant, CancellationToken cancellationToken = default);
    void Delete(ServiceVariant variant);
}
