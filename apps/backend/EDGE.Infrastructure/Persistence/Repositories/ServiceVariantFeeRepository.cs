using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceVariantFeeRepository : IServiceVariantFeeRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceVariantFeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceVariantFee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantFees
            .Include(svf => svf.ServiceVariant)
                .ThenInclude(sv => sv!.Service)
            .Include(svf => svf.Fee)
            .FirstOrDefaultAsync(svf => svf.Id == id, cancellationToken);
    }

    public async Task<List<ServiceVariantFee>> GetByServiceVariantIdAsync(Guid serviceVariantId, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantFees
            .Include(svf => svf.ServiceVariant)
                .ThenInclude(sv => sv!.Service)
            .Include(svf => svf.Fee)
            .Where(svf => svf.ServiceVariantId == serviceVariantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ServiceVariantFee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ServiceVariantFees
            .Include(svf => svf.ServiceVariant)
                .ThenInclude(sv => sv!.Service)
            .Include(svf => svf.Fee)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceVariantFee serviceVariantFee, CancellationToken cancellationToken = default)
    {
        await _context.ServiceVariantFees.AddAsync(serviceVariantFee, cancellationToken);
    }

    public void Delete(ServiceVariantFee serviceVariantFee)
    {
        _context.ServiceVariantFees.Remove(serviceVariantFee);
    }
}
