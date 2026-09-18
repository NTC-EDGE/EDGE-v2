using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Common.Interfaces;

public interface IOrBookletRepository
{
    Task<OrBooklet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrBooklet?> GetActiveBookletAsync(Guid tenantId, Guid? assignedUserId = null, CancellationToken cancellationToken = default);
    Task<List<OrBooklet>> GetByTenantAsync(Guid tenantId, BookletStatus? status = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsBookletNumberAsync(Guid tenantId, string bookletNumber, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(OrBooklet booklet, CancellationToken cancellationToken = default);
    Task UpdateAsync(OrBooklet booklet, CancellationToken cancellationToken = default);
}
