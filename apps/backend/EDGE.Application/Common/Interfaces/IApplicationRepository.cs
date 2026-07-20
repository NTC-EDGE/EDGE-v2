using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IApplicationRepository
{
    Task AddAsync(ApplicationRecord application, CancellationToken cancellationToken = default);
    Task<ApplicationRecord?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ApplicationRecord>> GetAllAsync(CancellationToken cancellationToken = default);
    void Delete(ApplicationRecord application);
}
