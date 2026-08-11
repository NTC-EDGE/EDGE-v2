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
            var normalizedRole = role.Replace("_", "").Replace("-", "").Trim();
            if (normalizedRole.Equals("superadmin", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        var tenantId = _tenantContextService.TenantId;
        if (!tenantId.HasValue)
        {
            // Fallback to default tenant if only one membership exists
            var memberships = await _dbContext.TenantMembers
                .Include(m => m.Role)
                .Where(m => m.UserId == user.Id)
                .ToListAsync(cancellationToken);

            if (memberships.Count == 1)
            {
                return memberships[0].Role.Key.Equals(role, StringComparison.OrdinalIgnoreCase);
            }
            return false;
        }

        var member = await _dbContext.TenantMembers
            .Include(m => m.Role)
            .FirstOrDefaultAsync(m => m.UserId == user.Id && m.TenantId == tenantId.Value, cancellationToken);

        return member?.Role?.Key?.Equals(role, StringComparison.OrdinalIgnoreCase) == true;
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
                Permissions.SubmitApplication,
                Permissions.ViewOwnApplications,
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
            var tenantId = _tenantContextService.TenantId;
            List<string> dbPermissions;
            if (tenantId.HasValue)
            {
                var query = from tm in _dbContext.Set<TenantMember>()
                            join rp in _dbContext.Set<RolePermission>() on tm.RoleId equals rp.RoleId
                            where tm.UserId == user.Id && tm.TenantId == tenantId.Value
                            select rp.PermissionKey;
                dbPermissions = await query.Distinct().ToListAsync(cancellationToken);
            }
            else
            {
                // Fallback: if no active tenant in request, load permissions across active memberships
                var query = from tm in _dbContext.Set<TenantMember>()
                            join rp in _dbContext.Set<RolePermission>() on tm.RoleId equals rp.RoleId
                            where tm.UserId == user.Id
                            select rp.PermissionKey;
                dbPermissions = await query.Distinct().ToListAsync(cancellationToken);
            }

            if (dbPermissions.Count == 0)
            {
                // Assign default client/applicant permissions for authenticated users who have no tenant membership yet
                dbPermissions = new List<string>
                {
                    Permissions.ReadTenants,
                    Permissions.ReadRoles,
                    Permissions.ReadServices,
                    Permissions.SubmitApplication,
                    Permissions.ViewOwnApplications,
                    Permissions.UploadStorage,
                    Permissions.ReadStorage,
                    Permissions.DownloadStorage
                };
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
