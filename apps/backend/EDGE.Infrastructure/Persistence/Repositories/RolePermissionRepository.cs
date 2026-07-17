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

    public void Delete(RolePermission rolePermission)
    {
        _context.Set<RolePermission>().Remove(rolePermission);
    }

    public async Task<RolePermission?> GetAsync(Guid roleId, Guid permissionId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<RolePermission>()
            .FirstOrDefaultAsync(x => x.RoleId == roleId && x.PermissionId == permissionId, cancellationToken);
    }

    public async Task<List<Permission>> GetAllPermissionsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Set<Permission>().ToListAsync(cancellationToken);
    }
}
