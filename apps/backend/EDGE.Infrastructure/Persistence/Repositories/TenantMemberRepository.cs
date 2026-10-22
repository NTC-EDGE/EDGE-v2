using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class TenantMemberRepository : ITenantMemberRepository
{
    private readonly ApplicationDbContext _context;

    public TenantMemberRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(TenantMember member, CancellationToken cancellationToken = default)
    {
        await _context.TenantMembers.AddAsync(member, cancellationToken);
    }

    public async Task<TenantMember?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var local = _context.TenantMembers.Local
            .FirstOrDefault(m => m.Id == id);
        if (local != null) return local;

        return await _context.TenantMembers
            .Include(m => m.Tenant)
            .Include(m => m.User)
            .Include(m => m.Role)
                .ThenInclude(r => r.RolePermissions)
            .Include(m => m.FieldOffice)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<TenantMember?> GetByTenantAndUserAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default)
    {
        var local = _context.TenantMembers.Local
            .FirstOrDefault(m => m.TenantId == tenantId && m.UserId == userId);
        if (local != null) return local;

        return await _context.TenantMembers
            .IgnoreQueryFilters()
            .Include(m => m.Tenant)
            .Include(m => m.User)
            .Include(m => m.Role)
                .ThenInclude(r => r.RolePermissions)
            .Include(m => m.FieldOffice)
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.UserId == userId, cancellationToken);
    }

    public async Task<List<TenantMember>> GetMembersByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.TenantMembers
            .Include(m => m.User)
            .Include(m => m.Role)
                .ThenInclude(r => r.RolePermissions)
            .Include(m => m.FieldOffice)
            .Include(m => m.Tenant)
            .Where(m => m.TenantId == tenantId && !m.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TenantMember>> GetMembersByUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.TenantMembers
            .Include(m => m.Tenant)
            .Include(m => m.Role)
                .ThenInclude(r => r.RolePermissions)
            .Include(m => m.FieldOffice)
            .Where(m => m.UserId == userId && !m.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public void Delete(TenantMember member)
    {
        _context.TenantMembers.Remove(member);
    }
}
