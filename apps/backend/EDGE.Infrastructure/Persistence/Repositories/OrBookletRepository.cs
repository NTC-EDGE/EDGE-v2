using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class OrBookletRepository : IOrBookletRepository
{
    private readonly ApplicationDbContext _context;

    public OrBookletRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrBooklet?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.OrBooklets
            .Include(b => b.AssignedUser)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<OrBooklet?> GetActiveBookletAsync(Guid tenantId, Guid? assignedUserId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.OrBooklets
            .Include(b => b.AssignedUser)
            .Where(b => (tenantId == Guid.Empty || b.TenantId == tenantId) && b.Status == BookletStatus.Active);

        if (assignedUserId.HasValue)
        {
            // Prefer booklet assigned to this cashier user, or fallback to unassigned active booklet
            var userBooklet = await query
                .Where(b => b.AssignedUserId == assignedUserId.Value)
                .OrderBy(b => b.ReceivedDate)
                .ThenBy(b => b.StartNumber)
                .FirstOrDefaultAsync(cancellationToken);

            if (userBooklet != null)
                return userBooklet;
        }

        return await query
            .Where(b => b.AssignedUserId == null || (assignedUserId.HasValue && b.AssignedUserId == assignedUserId.Value))
            .OrderBy(b => b.ReceivedDate)
            .ThenBy(b => b.StartNumber)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<OrBooklet>> GetByTenantAsync(Guid tenantId, BookletStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.OrBooklets
            .AsNoTracking()
            .Include(b => b.AssignedUser)
            .Where(b => tenantId == Guid.Empty || b.TenantId == tenantId);

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        return await query
            .OrderByDescending(b => b.Status == BookletStatus.Active)
            .ThenByDescending(b => b.ReceivedDate)
            .ThenBy(b => b.StartNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsBookletNumberAsync(Guid tenantId, string bookletNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.OrBooklets
            .Where(b => (tenantId == Guid.Empty || b.TenantId == tenantId) && b.BookletNumber == bookletNumber);

        if (excludeId.HasValue)
        {
            query = query.Where(b => b.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(OrBooklet booklet, CancellationToken cancellationToken = default)
    {
        await _context.OrBooklets.AddAsync(booklet, cancellationToken);
    }

    public Task UpdateAsync(OrBooklet booklet, CancellationToken cancellationToken = default)
    {
        _context.OrBooklets.Update(booklet);
        return Task.CompletedTask;
    }
}
