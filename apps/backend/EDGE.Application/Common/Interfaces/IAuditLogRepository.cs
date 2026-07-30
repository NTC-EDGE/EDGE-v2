using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface IAuditLogRepository
{
    Task<(List<AuditLog> Items, int TotalCount)> GetPagedAuditLogsAsync(int pageNumber, int pageSize, string? searchTerm = null, Guid? tenantId = null, CancellationToken cancellationToken = default);
    Task<(List<ActivityLog> Items, int TotalCount)> GetPagedActivityLogsAsync(int pageNumber, int pageSize, string? searchTerm = null, CancellationToken cancellationToken = default);
}
