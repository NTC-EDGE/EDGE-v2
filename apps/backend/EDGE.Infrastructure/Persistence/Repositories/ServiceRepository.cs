using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceRepository : IServiceRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Service>> GetServicesAsync(
        Guid? serviceCategoryId = null,
        Guid? tenantId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Services
            .Include(s => s.ServiceCategory)
            .AsQueryable();

        if (serviceCategoryId.HasValue)
            query = query.Where(s => s.ServiceCategoryId == serviceCategoryId.Value);

        if (tenantId.HasValue)
            query = query.Where(s => s.TenantId == tenantId.Value);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Services
            .Include(s => s.ServiceCategory)
            .Include(s => s.ServiceVariants)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariant>> GetVariantsByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Where(v => v.ServiceId == serviceId)
            .ToListAsync(cancellationToken);
    }
}
