using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IRequirementRepository
{
    // Master Requirement Catalog methods
    Task AddRequirementAsync(Requirement requirement, CancellationToken cancellationToken = default);
    Task<Requirement?> GetRequirementByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Requirement>> GetRequirementsAsync(CancellationToken cancellationToken = default);

    Task<Requirement?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Requirement>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Requirement requirement, CancellationToken cancellationToken = default);
    void Delete(Requirement requirement);
    Task<bool> IsNameUniqueAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);

    // Service Variant Requirement Rules methods
    Task AddServiceVariantRequirementAsync(ServiceVariantRequirement svr, CancellationToken cancellationToken = default);
    Task RemoveServiceVariantRequirementAsync(ServiceVariantRequirement svr, CancellationToken cancellationToken = default);
    Task<ServiceVariantRequirement?> GetServiceVariantRequirementByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantRequirement>> GetServiceVariantRequirementsAsync(Guid? serviceId, Guid? variantId, string? contextKey, CancellationToken cancellationToken = default);
}
