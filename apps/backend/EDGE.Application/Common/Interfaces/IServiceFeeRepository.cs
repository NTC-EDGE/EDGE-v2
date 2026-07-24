using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceFeeRepository
{
    Task<ServiceFee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceFee>> GetAllAsync(Guid? serviceId = null, Guid? feeId = null, bool? activeOnly = null, CancellationToken cancellationToken = default);
    Task AddAsync(ServiceFee serviceFee, CancellationToken cancellationToken = default);
    void Delete(ServiceFee serviceFee);
}
