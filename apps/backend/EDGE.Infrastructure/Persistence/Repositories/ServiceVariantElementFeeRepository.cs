using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceVariantElementFeeRepository : IServiceVariantElementFeeRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceVariantElementFeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVariantElementFee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantElementFees
            .Include(svef => svef.ServiceVariant)
            .Include(svef => svef.Element)
            .Include(svef => svef.Fee)
            .FirstOrDefaultAsync(svef => svef.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariantElementFee>> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantElementFees
            .Include(svef => svef.ServiceVariant)
            .Include(svef => svef.Element)
            .Include(svef => svef.Fee)
            .Where(svef => svef.ServiceVariantId == serviceVariantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ServiceVariantElementFee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantElementFees
            .Include(svef => svef.ServiceVariant)
            .Include(svef => svef.Element)
            .Include(svef => svef.Fee)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceVariantElementFee serviceVariantElementFee, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariantElementFees.AddAsync(serviceVariantElementFee, cancellationToken);
    }

    public void Delete(ServiceVariantElementFee serviceVariantElementFee)
    {
        _context.ServiceVariantElementFees.Remove(serviceVariantElementFee);
    }
}
