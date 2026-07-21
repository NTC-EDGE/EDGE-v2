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
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariant>> GetByServiceIdAsync(Guid serviceId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariants
            .Where(v => v.ServiceId == serviceId)
            .OrderBy(v => v.Type)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceVariant variant, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariants.AddAsync(variant, cancellationToken);
    }

    public void Delete(ServiceVariant variant)
    {
        _context.ServiceVariants.Remove(variant);
    }
}
