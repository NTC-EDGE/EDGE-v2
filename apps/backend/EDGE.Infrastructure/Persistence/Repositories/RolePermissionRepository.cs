using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class RolePermissionRepository : IRolePermissionRepository
{
    private readonly ApplicationDbContext _context;

    public RolePermissionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RolePermission rolePermission, CancellationToken cancellationToken = default)
    {
        await _context.Set<RolePermission>().AddAsync(rolePermission, cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<RolePermission> rolePermissions, CancellationToken cancellationToken = default)
    {
        await _context.Set<RolePermission>().AddRangeAsync(rolePermissions, cancellationToken);
    }

    public void Delete(RolePermission rolePermission)
    {
        _context.Set<RolePermission>().Remove(rolePermission);
    }

    public async Task<RolePermission?> GetAsync(Guid roleId, string permissionKey, CancellationToken cancellationToken = default)
    {
        return await _context.Set<RolePermission>()
            .FirstOrDefaultAsync(x => x.RoleId == roleId && x.PermissionKey == permissionKey, cancellationToken);
    }

    public async Task<List<string>> GetPermissionKeysForRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<RolePermission>()
            .Where(x => x.RoleId == roleId)
            .Select(x => x.PermissionKey)
            .ToListAsync(cancellationToken);
    }
}
