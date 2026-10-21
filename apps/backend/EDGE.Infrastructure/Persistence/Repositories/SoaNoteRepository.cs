using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class SoaNoteRepository : ISoaNoteRepository
{
    private readonly ApplicationDbContext _context;

    public SoaNoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SoaNote note, CancellationToken cancellationToken = default)
    {
        await _context.SoaNotes.AddAsync(note, cancellationToken);
    }

    public async Task<SoaNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SoaNotes
            .Include(n => n.Tenant)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<List<SoaNote>> GetAllAsync(Guid? tenantId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.SoaNotes
            .Include(n => n.Tenant)
            .AsNoTracking();

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            query = query.Where(n => n.TenantId == tenantId.Value);
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<SoaNote> Items, int TotalCount)> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm,
        Guid? tenantId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.SoaNotes
            .Include(n => n.Tenant)
            .AsNoTracking();

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            query = query.Where(n => n.TenantId == tenantId.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            query = query.Where(n =>
                n.Notes.ToLower().Contains(search) ||
                (n.Title != null && n.Title.ToLower().Contains(search)) ||
                (n.Code != null && n.Code.ToLower().Contains(search)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Delete(SoaNote note)
    {
        _context.SoaNotes.Remove(note);
    }
}
