using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IFeeRepository
{
    Task<Fee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Fee?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<List<Fee>> GetAllAsync(bool? activeOnly = null, CancellationToken cancellationToken = default);
    Task AddAsync(Fee fee, CancellationToken cancellationToken = default);
    void Delete(Fee fee);
}
