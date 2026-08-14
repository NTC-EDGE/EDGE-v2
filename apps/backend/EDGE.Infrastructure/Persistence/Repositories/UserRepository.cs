using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Role)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }

    public async Task<User?> GetByAuthUserIdAsync(string authUserId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Role)
            .FirstOrDefaultAsync(x => x.AuthUserId == authUserId, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Role)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users.ToListAsync(cancellationToken);
    }

    public async Task<StaffUserContext> GetStaffUserContextAsync(string? userIdStr, string defaultRole, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var parsedUserId))
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(x => x.TenantMemberships)
                    .ThenInclude(tm => tm.Role)
                .FirstOrDefaultAsync(x => x.Id == parsedUserId, cancellationToken);

            if (user != null)
            {
                var staffName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(staffName)) staffName = user.Email;

                var memberRole = user.TenantMemberships?.FirstOrDefault()?.Role?.Name 
                              ?? user.TenantMemberships?.FirstOrDefault()?.Position;

                var staffRole = !string.IsNullOrWhiteSpace(memberRole) ? memberRole : defaultRole;

                return new StaffUserContext(user.Id, staffName, staffRole);
            }
        }

        return new StaffUserContext(null, "System Staff", defaultRole);
    }

    public void Delete(User user)
    {
        _context.Users.Remove(user);
    }
}
