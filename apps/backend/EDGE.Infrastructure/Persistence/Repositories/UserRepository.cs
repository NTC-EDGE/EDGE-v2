using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Domain.Constants;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserRepository>? _logger;

    public UserRepository(ApplicationDbContext context, ILogger<UserRepository>? logger = null)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        var cleanEmail = email.Trim().ToLowerInvariant();

        var local = _context.Users.Local
            .FirstOrDefault(x => x.Email != null && x.Email.Trim().ToLowerInvariant() == cleanEmail);
        if (local != null) return local;

        return await _context.Users
            .IgnoreQueryFilters()
            .Include(x => x.CompanyDetail)
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Role)
            .FirstOrDefaultAsync(x => x.Email.ToLower() == cleanEmail, cancellationToken);
    }

    public async Task<User?> GetByAuthUserIdAsync(string authUserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(authUserId)) return null;

        var local = _context.Users.Local
            .FirstOrDefault(x => x.AuthUserId != null && x.AuthUserId.Equals(authUserId, StringComparison.OrdinalIgnoreCase));
        if (local != null) return local;

        return await _context.Users
            .IgnoreQueryFilters()
            .Include(x => x.CompanyDetail)
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
        var local = _context.Users.Local
            .FirstOrDefault(x => x.Id == id);
        if (local != null) return local;

        return await _context.Users
            .IgnoreQueryFilters()
            .Include(x => x.CompanyDetail)
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Role)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .IgnoreQueryFilters()
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Role)
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Tenant)
                    .ThenInclude(t => t.Region)
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.FieldOffice)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<User> Items, int TotalCount)> GetPaginatedUsersAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        Guid? tenantId = null,
        Guid? regionId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .AsNoTracking()
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Role)
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.Tenant)
                    .ThenInclude(t => t.Region)
            .Include(x => x.TenantMemberships)
                .ThenInclude(tm => tm.FieldOffice)
            .AsQueryable();

        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            query = query.Where(u => u.TenantMemberships != null && u.TenantMemberships.Any(tm => tm.TenantId == tenantId.Value));
        }

        if (regionId.HasValue && regionId.Value != Guid.Empty)
        {
            query = query.Where(u => u.TenantMemberships != null && u.TenantMemberships.Any(tm => tm.Tenant != null && tm.Tenant.RegionId == regionId.Value));
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(u =>
                (!string.IsNullOrEmpty(u.FirstName) && u.FirstName.ToLower().Contains(term)) ||
                (!string.IsNullOrEmpty(u.LastName) && u.LastName.ToLower().Contains(term)) ||
                (!string.IsNullOrEmpty(u.Email) && u.Email.ToLower().Contains(term)) ||
                (!string.IsNullOrEmpty(u.ContactNumber) && u.ContactNumber.Contains(term))
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var page = Math.Max(1, pageNumber);
        var size = Math.Clamp(pageSize <= 0 ? 50 : pageSize, 1, 1000);

        var items = await query
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> CountSuperAdminsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AsNoTracking()
            .CountAsync(u => u.IsSuperAdmin, cancellationToken);
    }

    public async Task<StaffUserContext> GetStaffUserContextAsync(string? userIdStr, string defaultRole, CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(userIdStr))
        {
            User? user = null;
            if (Guid.TryParse(userIdStr, out var parsedUserId))
            {
                user = await GetByIdAsync(parsedUserId, cancellationToken);
            }

            if (user == null && userIdStr.Contains('@'))
            {
                user = await GetByEmailAsync(userIdStr, cancellationToken);
            }

            if (user == null)
            {
                user = await GetByAuthUserIdAsync(userIdStr, cancellationToken);
            }

            if (user != null)
            {
                var staffName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(staffName)) staffName = user.Email;

                var memberRole = user.TenantMemberships?.FirstOrDefault()?.Role?.Name 
                              ?? user.TenantMemberships?.FirstOrDefault()?.Position;

                var staffRole = !string.IsNullOrWhiteSpace(memberRole) ? memberRole : defaultRole;

                return new StaffUserContext(user.Id, staffName, staffRole);
            }

            _logger?.LogWarning("Staff user context lookup failed for '{UserIdStr}'. Falling back to default role '{DefaultRole}'.", userIdStr, defaultRole);
        }
        else
        {
            _logger?.LogWarning("Staff user context requested with null/empty user ID. Falling back to default role '{DefaultRole}'.", defaultRole);
        }

        return new StaffUserContext(null, "System Staff", defaultRole);
    }

    public async Task<User?> ResolveCurrentUserAsync(ICurrentUserService currentUserService, CancellationToken cancellationToken = default)
    {
        var authUserId = currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(authUserId))
        {
            return null;
        }

        // 1. Direct AuthUserId lookup
        var user = await GetByAuthUserIdAsync(authUserId, cancellationToken);
        if (user != null)
        {
            return user;
        }

        // 2. Parsed GUID lookup (system accounts or internal IDs)
        if (Guid.TryParse(authUserId, out var parsedUserId))
        {
            user = await GetByIdAsync(parsedUserId, cancellationToken);
            if (user != null)
            {
                return user;
            }
        }

        var ipAddress = currentUserService.IpAddress ?? "Unknown IP";
        var tenantScope = currentUserService.TenantId?.ToString() ?? "Global";

        // 3. Fallback auto-linking via verified email
        if (!string.IsNullOrWhiteSpace(currentUserService.Email) && currentUserService.IsEmailVerified)
        {
            var cleanEmail = currentUserService.Email.Trim().ToLowerInvariant();
            var candidateUser = await GetByEmailAsync(cleanEmail, cancellationToken);

            if (candidateUser != null)
            {
                candidateUser.AuthUserId = authUserId;
                if (currentUserService.IsSuperAdminClaim || AdministrativeIdentityPolicy.IsSuperAdminEmail(cleanEmail))
                {
                    candidateUser.IsSuperAdmin = true;
                }

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                    _logger?.LogInformation("Security Audit: Auto-linked verified email '{Email}' to AuthUserId '{AuthUserId}' from IP '{IpAddress}' [Tenant: {TenantScope}]", cleanEmail, authUserId, ipAddress, tenantScope);
                    return candidateUser;
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Security/DB Audit: Error updating AuthUserId during auto-linking for '{Email}'. Returning candidate user.", cleanEmail);
                    return candidateUser;
                }
            }
            else
            {
                // 4. Secure Auto-provisioning: only grant administrative roles if verified claims or exact seed admin emails match
                var isSuperAdmin = currentUserService.IsSuperAdminClaim || AdministrativeIdentityPolicy.IsSuperAdminEmail(cleanEmail);
                var isAdmin = isSuperAdmin || currentUserService.IsAdminClaim || AdministrativeIdentityPolicy.IsAdministrativeEmail(cleanEmail);

                var newUser = new User
                {
                    Id = Guid.NewGuid(),
                    AuthUserId = authUserId,
                    Email = cleanEmail,
                    FirstName = isSuperAdmin ? "Super" : (isAdmin ? "Regional" : "User"),
                    LastName = isSuperAdmin ? "Administrator" : (isAdmin ? "Admin" : "Account"),
                    IsSuperAdmin = isSuperAdmin,
                    CreatedAt = DateTime.UtcNow
                };

                try
                {
                    await _context.Users.AddAsync(newUser, cancellationToken);

                    // If verified claims or seed admin emails indicate an administrator, assign default tenant membership
                    if (isAdmin || isSuperAdmin)
                    {
                        var defaultTenantId = SeedConstants.DefaultTenantId;
                        var targetRoleId = isSuperAdmin
                            ? SeedConstants.Roles.SuperAdminRoleId
                            : SeedConstants.Roles.AdminRoleId;

                        var tenantExists = await _context.Tenants.AnyAsync(t => t.Id == defaultTenantId, cancellationToken);
                        var roleExists = await _context.Roles.AnyAsync(r => r.Id == targetRoleId, cancellationToken);
                        if (tenantExists && roleExists)
                        {
                            var newMembership = new TenantMember
                            {
                                Id = Guid.NewGuid(),
                                TenantId = defaultTenantId,
                                UserId = newUser.Id,
                                RoleId = targetRoleId,
                                CreatedAt = DateTime.UtcNow
                            };
                            await _context.TenantMembers.AddAsync(newMembership, cancellationToken);
                        }
                    }

                    await _context.SaveChangesAsync(cancellationToken);
                    _logger?.LogInformation("Auto-provisioned new verified user '{Email}' ({AuthUserId}) with SuperAdmin={IsSuperAdmin}.", cleanEmail, authUserId, isSuperAdmin);
                    return newUser;
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Database concurrency/exception while auto-provisioning '{Email}'. Attempting retrieval...", cleanEmail);
                    var freshUser = await GetByEmailAsync(cleanEmail, cancellationToken);
                    if (freshUser != null)
                    {
                        return freshUser;
                    }
                }
            }
        }
        else if (!string.IsNullOrWhiteSpace(currentUserService.Email) && !currentUserService.IsEmailVerified)
        {
            _logger?.LogWarning("Security Audit: Skipping auto-linking from IP '{IpAddress}' [Tenant: {TenantScope}] for AuthUserId '{AuthUserId}' because email '{Email}' is unverified.",
                ipAddress, tenantScope, authUserId, currentUserService.Email);
        }

        return null;
    }

    public void Delete(User user)
    {
        _context.Users.Remove(user);
    }
}
