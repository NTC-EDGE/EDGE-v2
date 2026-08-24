using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;

    public RoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Role?> GetByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Role>().FirstOrDefaultAsync(x => x.Key == key, cancellationToken);
    }

    public async Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Role>().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<Role>> GetAllByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Role>()
            .Where(x => x.TenantId == tenantId || x.TenantId == null)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Role>> GetSystemRolesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<Role>().Where(x => x.IsSystemRole).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Role role, CancellationToken cancellationToken = default)
    {
        await _context.Set<Role>().AddAsync(role, cancellationToken);
    }

    public async Task<List<Role>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<Role>().ToListAsync(cancellationToken);
    }

    public async Task<bool> IsRoleNameUniqueAsync(string name, Guid? tenantId = null, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(name))
            return true;

        var normalizedName = name.Trim().ToLower();
        var query = _context.Set<Role>().AsQueryable();

        if (excludeId.HasValue)
        {
            query = query.Where(r => r.Id != excludeId.Value);
        }

        if (tenantId.HasValue)
        {
            query = query.Where(r => r.TenantId == tenantId.Value || r.TenantId == null || r.IsSystemRole);
        }
        else
        {
            query = query.Where(r => r.TenantId == null || r.IsSystemRole);
        }

        return !await query.AnyAsync(r => r.Name.ToLower() == normalizedName, cancellationToken);
    }

    public void Delete(Role role)
    {
        _context.Set<Role>().Remove(role);
    }
}
