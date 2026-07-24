using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class FeeRepository : IFeeRepository
{
    private readonly ApplicationDbContext _context;

    public FeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Fee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Fees
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<Fee?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Fees
            .FirstOrDefaultAsync(f => f.Code.ToLower() == code.ToLower(), cancellationToken);
    }

    public async Task<List<Fee>> GetAllAsync(bool? activeOnly = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Fees.AsQueryable();

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(f => f.IsActive);
        }

        return await query
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Fee fee, CancellationToken cancellationToken = default)
    {
        await _context.Fees.AddAsync(fee, cancellationToken);
    }

    public void Delete(Fee fee)
    {
        _context.Fees.Remove(fee);
    }
}
