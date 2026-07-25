using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IRequirementRepository
{
    Task<Requirement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Requirement>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Requirement requirement, CancellationToken cancellationToken = default);
    void Delete(Requirement requirement);
    Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
