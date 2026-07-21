using System;
using System.Collections.Generic;
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

    public async Task<List<Service>> GetServicesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Services
            .Include(s => s.ServiceCategory)
            .Include(s => s.ServiceVariants)
            .ToListAsync(cancellationToken);
    }

    public async Task<Service?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Services
            .Include(s => s.ServiceCategory)
            .Include(s => s.ServiceVariants)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }
}
