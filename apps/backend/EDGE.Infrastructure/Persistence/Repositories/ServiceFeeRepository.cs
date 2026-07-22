using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class ServiceFeeRepository : IServiceFeeRepository
{
    private readonly ApplicationDbContext _context;

    public ServiceFeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceFee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ServiceFees
            .Include(sf => sf.Fee)
            .Include(sf => sf.Service)
            .FirstOrDefaultAsync(sf => sf.Id == id, cancellationToken);
    }

    public async Task<List<ServiceFee>> GetAllAsync(
        Guid? serviceId = null,
        Guid? feeId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ServiceFees
            .Include(sf => sf.Fee)
            .Include(sf => sf.Service)
            .AsQueryable();

        if (serviceId.HasValue)
        {
            query = query.Where(sf => sf.ServiceId == serviceId.Value);
        }

        if (feeId.HasValue)
        {
            query = query.Where(sf => sf.FeeId == feeId.Value);
        }

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(sf => sf.IsActive);
        }

        return await query
            .OrderByDescending(sf => sf.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ServiceFee serviceFee, CancellationToken cancellationToken = default)
    {
        await _context.ServiceFees.AddAsync(serviceFee, cancellationToken);
    }

    public void Delete(ServiceFee serviceFee)
    {
        _context.ServiceFees.Remove(serviceFee);
    }
}
