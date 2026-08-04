using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceVariantRepository : IServiceVariantRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceVariantRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVariant?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Include(v => v.Service)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariant>> GetByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Where(v => v.ServiceId == serviceId)
            .Include(v => v.Service)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ServiceVariant>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Include(v => v.Service)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceVariant serviceVariant, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariants.AddAsync(serviceVariant, cancellationToken);
    }

    public void Delete(ServiceVariant serviceVariant)
    {
        _context.ServiceVariants.Remove(serviceVariant);
    }
}
