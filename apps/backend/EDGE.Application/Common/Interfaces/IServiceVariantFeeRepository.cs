using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceVariantFeeRepository
{
    Task<ServiceVariantFee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantFee>> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantFee>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ServiceVariantFee serviceVariantFee, CancellationToken cancellationToken = default);
    void Delete(ServiceVariantFee serviceVariantFee);
}
