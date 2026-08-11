using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceVariantElementRepository : IServiceVariantElementRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceVariantElementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVariantElement?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantElements
            .Include(e => e.ServiceVariant)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariantElement>> GetAllByVariantAsync(
        Guid serviceVariantId,
        CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantElements
            .Include(e => e.ServiceVariant)
            .Where(e => e.ServiceVariantId == serviceVariantId)
            .OrderBy(e => e.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ServiceVariantElement>> GetAllAsync(
        Guid? serviceId,
        Guid? serviceVariantId,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceVariantElements
            .Include(e => e.ServiceVariant)
            .AsQueryable();

        if (serviceId.HasValue)
        {
            query = query.Where(e => e.ServiceVariant != null && e.ServiceVariant.ServiceId == serviceId.Value);
        }

        if (serviceVariantId.HasValue)
        {
            query = query.Where(e => e.ServiceVariantId == serviceVariantId.Value);
        }

        return await query
            .OrderBy(e => e.Code)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        ServiceVariantElement element,
        CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariantElements.AddAsync(element, cancellationToken);
    }

    public void Delete(ServiceVariantElement element)
    {
        _context.ServiceVariantElements.Remove(element);
    }
}
