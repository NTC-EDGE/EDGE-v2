using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceCategoryRepository
{
    Task<List<ServiceCategory>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ServiceCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(ServiceCategory category, CancellationToken cancellationToken = default);
    void Delete(ServiceCategory category);
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> HasServicesAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Dictionary<Guid, int>> GetServiceCountsAsync(CancellationToken cancellationToken = default);
}
