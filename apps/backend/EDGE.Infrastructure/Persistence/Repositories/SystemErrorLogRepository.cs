using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class SystemErrorLogRepository : ISystemErrorLogRepository
{
    private readonly ApplicationDbContext _context;

    public SystemErrorLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SystemErrorLog log, CancellationToken cancellationToken = default)
    {
        await _context.SystemErrorLogs.AddAsync(log, cancellationToken);
    }

    public async Task<(List<SystemErrorLog> Items, int TotalCount)> GetPagedErrorLogsAsync(
        int pageNumber,
        int pageSize,
        string? level = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SystemErrorLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(level))
        {
            query = query.Where(l => l.Level == level);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(l =>
                l.Message.ToLower().Contains(term) ||
                (l.ExceptionType != null && l.ExceptionType.ToLower().Contains(term)) ||
                (l.RequestPath != null && l.RequestPath.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(l => l.LoggedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
