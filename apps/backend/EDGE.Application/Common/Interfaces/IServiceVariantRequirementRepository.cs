using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceVariantRequirementRepository
{
    Task<ServiceVariantRequirement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantRequirement>> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default);
    Task AddAsync(ServiceVariantRequirement serviceVariantRequirement, CancellationToken cancellationToken = default);
    void Delete(ServiceVariantRequirement serviceVariantRequirement);
}
