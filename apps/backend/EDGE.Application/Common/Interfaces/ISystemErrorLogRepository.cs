using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EDGE.Domain.Entities;

namespace EDGE.Application.Common.Interfaces;

public interface ISystemErrorLogRepository
{
    Task AddAsync(SystemErrorLog log, CancellationToken cancellationToken = default);
    Task<(List<SystemErrorLog> Items, int TotalCount)> GetPagedErrorLogsAsync(
        int pageNumber,
        int pageSize,
        string? level = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);
}
