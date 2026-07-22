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
}
