using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IServiceInformationRepository
{
    Task<List<ServiceInformation>> GetAllAsync(string? search = null, Guid? serviceId = null, CancellationToken cancellationToken = default);
    Task<(List<ServiceInformation> Items, int TotalCount)> GetPagedAsync(string? search = null, Guid? serviceId = null, int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<ServiceInformation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceInformation?> GetByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default);
    Task AddAsync(ServiceInformation entity, CancellationToken cancellationToken = default);
    void Update(ServiceInformation entity);
    void Delete(ServiceInformation entity);
}
