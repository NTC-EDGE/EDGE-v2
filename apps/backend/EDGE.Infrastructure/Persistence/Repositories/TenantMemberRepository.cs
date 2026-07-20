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

    public async Task<TenantMember?> GetMemberAsync(Guid userId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.TenantMembers
            .Include(x => x.Tenant)
            .Include(x => x.User)
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.UserId == userId && x.TenantId == tenantId, cancellationToken);
    }

    public async Task<List<TenantMember>> GetMembersOfTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.TenantMembers
            .Include(x => x.Tenant)
            .Include(x => x.User)
            .Include(x => x.Role)
            .Where(x => x.TenantId == tenantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<TenantMember>> GetTenantsForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.TenantMembers
            .Include(x => x.Tenant)
            .Include(x => x.User)
            .Include(x => x.Role)
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(TenantMember member, CancellationToken cancellationToken = default)
    {
        await _context.TenantMembers.AddAsync(member, cancellationToken);
    }

    public void Delete(TenantMember member)
    {
        _context.TenantMembers.Remove(member);
    }
}
