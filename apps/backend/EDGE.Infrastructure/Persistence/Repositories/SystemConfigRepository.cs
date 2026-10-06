using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class SystemConfigRepository : ISystemConfigRepository
{
    private readonly ApplicationDbContext _context;

    public SystemConfigRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SystemConfig config, CancellationToken cancellationToken = default)
    {
        await _context.SystemConfigs.AddAsync(config, cancellationToken);
    }

    public async Task<SystemConfig?> GetByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        return await _context.SystemConfigs
            .FirstOrDefaultAsync(c => c.Key == key, cancellationToken);
    }

    public async Task<List<SystemConfig>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
    {
        return await _context.SystemConfigs
            .Where(c => c.Category == category)
            .OrderBy(c => c.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<SystemConfig>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SystemConfigs
            .OrderBy(c => c.Category)
            .ThenBy(c => c.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<SystemConfig>> GetPublicConfigsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SystemConfigs
            .Where(c => c.IsPublic)
            .OrderBy(c => c.Key)
            .ToListAsync(cancellationToken);
    }

    public void Update(SystemConfig config)
    {
        var entry = _context.Entry(config);
        if (entry.State == EntityState.Detached)
        {
            _context.SystemConfigs.Update(config);
        }
    }
}
