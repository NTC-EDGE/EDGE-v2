using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class FieldOfficeRepository : IFieldOfficeRepository
{
    private readonly ApplicationDbContext _context;

    public FieldOfficeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldOffice>> GetAllAsync(Guid? regionId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.FieldOffices.Include(f => f.Region).AsQueryable();

        if (regionId.HasValue)
        {
            query = query.Where(f => f.RegionId == regionId.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<FieldOffice?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.FieldOffices
            .Include(f => f.Region)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task AddAsync(FieldOffice office, CancellationToken cancellationToken = default)
    {
        await _context.FieldOffices.AddAsync(office, cancellationToken);
    }

    public void Delete(FieldOffice office)
    {
        _context.FieldOffices.Remove(office);
    }

    public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return true;

        var query = _context.FieldOffices.Where(f => f.Code != null && f.Code.ToLower() == code.ToLower());

        if (excludeId.HasValue)
        {
            query = query.Where(f => f.Id != excludeId.Value);
        }

        return !await query.AnyAsync(cancellationToken);
    }

    public Task<bool> HasApplicationsAsync(Guid officeId, CancellationToken cancellationToken = default)
    {
        // Application entity does not currently have a direct FieldOfficeId FK. Placeholder for future constraint.
        return Task.FromResult(false);
    }
}
