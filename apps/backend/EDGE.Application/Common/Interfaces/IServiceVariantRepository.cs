using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceVariantRepository
{
    Task<ServiceVariant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ServiceVariant>> GetByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task<List<ServiceVariant>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ServiceVariant serviceVariant, CancellationToken cancellationToken = default);
    void Delete(ServiceVariant serviceVariant);
}
