using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceVariantElementRepository
{
    Task<ServiceVariantElement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantElement>> GetAllByVariantAsync(Guid serviceVariantId, CancellationToken cancellationToken = default);
    Task AddAsync(ServiceVariantElement element, CancellationToken cancellationToken = default);
    void Delete(ServiceVariantElement element);
}
