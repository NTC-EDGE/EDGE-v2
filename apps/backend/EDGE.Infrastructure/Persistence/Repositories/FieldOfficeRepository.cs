using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class FieldOfficeRepository : IFieldOfficeRepository
{
    private readonly ApplicationDbContext _context;

    public FieldOfficeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(FieldOffice fieldOffice, CancellationToken cancellationToken = default)
    {
        await _context.FieldOffices.AddAsync(fieldOffice, cancellationToken);
    }

    public async Task<FieldOffice?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.FieldOffices
            .Include(f => f.Tenant)
            .Include(f => f.Region)
            .Include(f => f.Province)
            .Include(f => f.OfficerInCharge)
                .ThenInclude(o => o.User)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<List<FieldOffice>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.FieldOffices
            .Include(f => f.Tenant)
            .Include(f => f.Region)
            .Include(f => f.Province)
            .Include(f => f.OfficerInCharge)
                .ThenInclude(o => o.User)
            .Where(f => f.TenantId == tenantId)
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<FieldOffice>> GetFilteredAsync(Guid? tenantId = null, Guid? regionId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.FieldOffices
            .Include(f => f.Tenant)
            .Include(f => f.Region)
            .Include(f => f.Province)
            .Include(f => f.OfficerInCharge)
                .ThenInclude(o => o.User)
            .AsQueryable();

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            query = query.Where(f => f.TenantId == tenantId.Value);
        }

        if (regionId.HasValue && regionId.Value != Guid.Empty)
        {
            query = query.Where(f => f.RegionId == regionId.Value);
        }

        return await query.OrderBy(f => f.Name).ToListAsync(cancellationToken);
    }

    public async Task<List<FieldOffice>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.FieldOffices
            .Include(f => f.Tenant)
            .Include(f => f.Region)
            .Include(f => f.Province)
            .Include(f => f.OfficerInCharge)
                .ThenInclude(o => o.User)
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public void Delete(FieldOffice fieldOffice)
    {
        _context.FieldOffices.Remove(fieldOffice);
    }

    public async Task<bool> IsCodeUniqueAsync(Guid tenantId, string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.FieldOffices.Where(f => f.TenantId == tenantId);
        if (excludeId.HasValue)
        {
            query = query.Where(f => f.Id != excludeId.Value);
        }
        return !await query.AnyAsync(f => f.Code.ToLower() == code.ToLower(), cancellationToken);
    }
}
