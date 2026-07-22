using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceCategoryRepository : IServiceCategoryRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceCategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceCategory>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceCategories.ToListAsync(cancellationToken);
    }

    public async Task<ServiceCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceCategories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task AddAsync(ServiceCategory category, CancellationToken cancellationToken = default)
    {
        await _context.ServiceCategories.AddAsync(category, cancellationToken);
    }

    public void Delete(ServiceCategory category)
    {
        _context.ServiceCategories.Remove(category);
    }

    public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return true;

        var query = _context.ServiceCategories.AsQueryable();
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return !await query.AnyAsync(x => x.Code != null && x.Code.ToLower() == code.ToLower(), cancellationToken);
    }

    public async Task<bool> HasServicesAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _context.Services.AnyAsync(s => s.ServiceCategoryId == categoryId, cancellationToken);
    }
}
