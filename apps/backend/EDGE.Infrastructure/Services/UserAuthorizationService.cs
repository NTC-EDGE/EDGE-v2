using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Services;

public class UserAuthorizationService : IUserAuthorizationService
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUserRepository _userRepository;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<UserAuthorizationService> _logger;

    private static readonly HashSet<string> AdministrativeRoleKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "admin",
        "administrator",
        "superadmin",
        "super_admin",
        "super-admin",
        "systemadmin",
        "system_admin",
        "system-admin",
        "tenantadmin",
        "tenant_admin",
        "tenant-admin",
        "regionaladmin",
        "regional_admin",
        "regional-admin",
        "regionaldirector",
        "regional_director",
        "regional-director",
        "director"
    };

    private static bool IsAdministrativeRole(string? roleKey)
    {
        if (string.IsNullOrWhiteSpace(roleKey)) return false;
        var trimmed = roleKey.Trim();
        if (AdministrativeRoleKeys.Contains(trimmed)) return true;
        var normalized = trimmed.Replace("-", "").Replace("_", "").Replace(" ", "");
        return AdministrativeRoleKeys.Contains(normalized);
    }

    private User? _cachedUser;
    private List<string>? _cachedPermissions;

    public UserAuthorizationService(
        ICurrentUserService currentUserService,
        ITenantContextService tenantContextService,
        IUserRepository userRepository,
        ApplicationDbContext dbContext,
        ILogger<UserAuthorizationService> logger)
    {
        _currentUserService = currentUserService;
        _tenantContextService = tenantContextService;
        _userRepository = userRepository;
        _dbContext = dbContext;
        _logger = logger;
    }

    private async Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedUser != null)
        {
            return _cachedUser;
        }

        var authUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(authUserId))
        {
            _logger.LogWarning("No authenticated user ID found in context claims.");
            return null;
        }

        try
        {
            _cachedUser = await _userRepository.GetByAuthUserIdAsync(authUserId, cancellationToken);
            if (_cachedUser == null && !string.IsNullOrWhiteSpace(_currentUserService.Email))
            {
                var cleanEmail = _currentUserService.Email.Trim().ToLowerInvariant();
                _cachedUser = await _userRepository.GetByEmailAsync(cleanEmail, cancellationToken);
                if (_cachedUser != null && _cachedUser.AuthUserId != authUserId)
                {
                    _cachedUser.AuthUserId = authUserId;
                    await _dbContext.SaveChangesAsync(cancellationToken);
                }
            }
            return _cachedUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current database user for AuthUserId: {AuthUserId}", authUserId);
            return null;
        }
    }

    public async Task<bool> HasPermissionAsync(string permission, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(permission))
        {
            return false;
        }

        var permissions = await GetUserPermissionsAsync(cancellationToken);
        return permissions.Contains(permission);
    }

    public async Task<bool> HasAnyPermissionAsync(IEnumerable<string> permissions, CancellationToken cancellationToken = default)
    {
        if (permissions == null || !permissions.Any())
        {
            return false;
        }

        var userPermissions = await GetUserPermissionsAsync(cancellationToken);
        return permissions.Any(p => userPermissions.Contains(p));
    }

    public async Task<bool> HasAllPermissionsAsync(IEnumerable<string> permissions, CancellationToken cancellationToken = default)
    {
        if (permissions == null || !permissions.Any())
        {
            return true;
        }

        var userPermissions = await GetUserPermissionsAsync(cancellationToken);
        return permissions.All(p => userPermissions.Contains(p));
    }

    public async Task<bool> HasRoleAsync(string role, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(role))
        {
            return false;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null) return false;

        if (user.IsSuperAdmin)
        {
            if (IsAdministrativeRole(role))
            {
                return true;
            }
        }

        var tenantId = _tenantContextService.TenantId;
        if (!tenantId.HasValue)
        {
            var memberships = await _dbContext.TenantMembers
                .Include(m => m.Role)
                .Where(m => m.UserId == user.Id && !m.IsDeleted)
                .ToListAsync(cancellationToken);

            return memberships.Any(m => m.Role != null && (m.Role.Key.Equals(role, StringComparison.OrdinalIgnoreCase) || (IsAdministrativeRole(role) && IsAdministrativeRole(m.Role.Key))));
        }

        var member = await _dbContext.TenantMembers
            .Include(m => m.Role)
            .FirstOrDefaultAsync(m => m.UserId == user.Id && m.TenantId == tenantId.Value && !m.IsDeleted, cancellationToken);

        return member?.Role != null && (member.Role.Key.Equals(role, StringComparison.OrdinalIgnoreCase) || (IsAdministrativeRole(role) && IsAdministrativeRole(member.Role.Key)));
    }

    public async Task<bool> IsInternalUserAsync(CancellationToken cancellationToken = default)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            return false;
        }

        if (user.IsSuperAdmin)
        {
            return true;
        }

        return await _dbContext.TenantMembers.AnyAsync(tm => tm.UserId == user.Id && !tm.IsDeleted, cancellationToken);
    }

    public async Task<bool> CanSubmitApplicationAsync(CancellationToken cancellationToken = default)
    {
        var authUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(authUserId))
        {
            return false;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            // Unregistered / new authenticated user acting as client applicant
            return true;
        }

        if (user.IsSuperAdmin)
        {
            return true;
        }

        var isInternal = await _dbContext.TenantMembers.AnyAsync(tm => tm.UserId == user.Id && !tm.IsDeleted, cancellationToken);
        if (!isInternal)
        {
            // Public client applicant
            return true;
        }

        // Internal staff account: strictly require Permissions.SubmitApplication
        return await HasPermissionAsync(Permissions.SubmitApplication, cancellationToken);
    }

    public async Task<List<string>> GetUserPermissionsAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedPermissions != null)
        {
            return _cachedPermissions;
        }

        var authUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(authUserId))
        {
            _cachedPermissions = [];
            return _cachedPermissions;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            // Assign default client/applicant permissions for authenticated users who have no database record yet
            _cachedPermissions = new List<string>
            {
                Permissions.ReadTenants,
                Permissions.ReadRoles,
                Permissions.ReadServices,
                Permissions.ReadRequirements,
                Permissions.SubmitApplication,
                Permissions.ViewOwnApplications,
                Permissions.ReadApplication,
                Permissions.UploadStorage,
                Permissions.ReadStorage,
                Permissions.DownloadStorage
            };
            return _cachedPermissions;
        }

        // SuperAdmin has ALL permissions across the system
        if (user.IsSuperAdmin)
        {
            _cachedPermissions = Permissions.AllKeys.ToList();
            return _cachedPermissions;
        }

        try
        {
            var isInternal = await _dbContext.TenantMembers.AnyAsync(tm => tm.UserId == user.Id && !tm.IsDeleted, cancellationToken);
            if (!isInternal)
            {
                // Public client applicant permissions
                _cachedPermissions = new List<string>
                {
                    Permissions.ReadTenants,
                    Permissions.ReadRoles,
                    Permissions.ReadServices,
                    Permissions.ReadRequirements,
                    Permissions.SubmitApplication,
                    Permissions.ViewOwnApplications,
                    Permissions.ReadApplication,
                    Permissions.UploadStorage,
                    Permissions.ReadStorage,
                    Permissions.DownloadStorage
                };
                return _cachedPermissions;
            }

            // Check if user holds an Admin/Administrator role in any active tenant membership
            var memberRoleKeys = await _dbContext.TenantMembers
                .Where(tm => tm.UserId == user.Id && !tm.IsDeleted && tm.Role != null)
                .Select(tm => tm.Role!.Key)
                .ToListAsync(cancellationToken);

            if (memberRoleKeys.Any(IsAdministrativeRole))
            {
                _cachedPermissions = Permissions.AllKeys.ToList();
                return _cachedPermissions;
            }

            var tenantId = _tenantContextService.TenantId;
            List<string> dbPermissions = new();
            if (tenantId.HasValue)
            {
                var query = from tm in _dbContext.Set<TenantMember>()
                            join rp in _dbContext.Set<RolePermission>() on tm.RoleId equals rp.RoleId
                            where tm.UserId == user.Id && tm.TenantId == tenantId.Value && !tm.IsDeleted
                            select rp.PermissionKey;
                dbPermissions = await query.Distinct().ToListAsync(cancellationToken);
            }

            if (dbPermissions.Count == 0)
            {
                // Fallback: if no active tenant in request or specified tenant has no matches, load permissions across all active memberships
                var query = from tm in _dbContext.Set<TenantMember>()
                            join rp in _dbContext.Set<RolePermission>() on tm.RoleId equals rp.RoleId
                            where tm.UserId == user.Id && !tm.IsDeleted
                            select rp.PermissionKey;
                dbPermissions = await query.Distinct().ToListAsync(cancellationToken);
            }

            // Ensure foundational read permissions are always available to active staff members
            var basePermissions = new[]
            {
                Permissions.ReadTenants,
                Permissions.ReadRoles,
                Permissions.ReadServices,
                Permissions.ReadRequirements,
                Permissions.ReadSchedules
            };

            foreach (var basePerm in basePermissions)
            {
                if (!dbPermissions.Contains(basePerm))
                {
                    dbPermissions.Add(basePerm);
                }
            }

            _cachedPermissions = dbPermissions;
            return _cachedPermissions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving database permissions for user: {UserId}", user.Id);
            _cachedPermissions = [];
            return _cachedPermissions;
        }
    }
}
