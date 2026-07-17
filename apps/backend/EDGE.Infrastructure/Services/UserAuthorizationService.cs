using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Services;

public class UserAuthorizationService : IUserAuthorizationService
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<UserAuthorizationService> _logger;

    private User? _cachedUser;
    private List<string>? _cachedPermissions;

    public UserAuthorizationService(
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ApplicationDbContext dbContext,
        ILogger<UserAuthorizationService> logger)
    {
        _currentUserService = currentUserService;
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
        return user?.Role?.Key?.Equals(role, StringComparison.OrdinalIgnoreCase) == true;
    }

    public async Task<List<string>> GetUserPermissionsAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedPermissions != null)
        {
            return _cachedPermissions;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user?.Role == null)
        {
            _cachedPermissions = [];
            return _cachedPermissions;
        }

        try
        {
            var query = from rp in _dbContext.Set<RolePermission>()
                        join p in _dbContext.Set<Permission>() on rp.PermissionId equals p.Id
                        where rp.RoleId == user.RoleId
                        select p.Key;

            _cachedPermissions = await query.ToListAsync(cancellationToken);
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
