using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceRepository
{
    Task<List<Service>> GetServicesAsync(Guid? serviceCategoryId = null, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariant>> GetVariantsByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<ServiceVariant?> GetVariantByIdAsync(Guid variantId, CancellationToken cancellationToken = default);
    Task AddAsync(Service service, CancellationToken cancellationToken = default);
    void Delete(Service service);
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> HasApplicationsAsync(Guid serviceId, CancellationToken cancellationToken = default);
}
