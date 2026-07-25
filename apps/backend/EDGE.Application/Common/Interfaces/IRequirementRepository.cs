using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IRequirementRepository
{
    Task AddRequirementAsync(Requirement requirement, CancellationToken cancellationToken = default);
    Task<Requirement?> GetRequirementByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Requirement>> GetRequirementsAsync(CancellationToken cancellationToken = default);

    Task AddServiceVariantRequirementAsync(ServiceVariantRequirement svr, CancellationToken cancellationToken = default);
    Task RemoveServiceVariantRequirementAsync(ServiceVariantRequirement svr, CancellationToken cancellationToken = default);
    Task<ServiceVariantRequirement?> GetServiceVariantRequirementByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariantRequirement>> GetServiceVariantRequirementsAsync(Guid? serviceId, Guid? variantId, string? contextKey, CancellationToken cancellationToken = default);
}
