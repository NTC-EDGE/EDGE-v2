using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceVariantElementFeeRepository
{
    Task<ServiceVariantElementFee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantElementFee>> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantElementFee>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ServiceVariantElementFee serviceVariantElementFee, CancellationToken cancellationToken = default);
    void Delete(ServiceVariantElementFee serviceVariantElementFee);
}
