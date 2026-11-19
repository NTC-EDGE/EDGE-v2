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
            _cachedUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken);
            return _cachedUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current database user for AuthUserId: {AuthUserId}", authUserId);
            return null;
        }
    }

    private static readonly HashSet<string> ApplicationFilingPermissions = new(StringComparer.OrdinalIgnoreCase)
    {
        Permissions.SubmitApplication,
        Permissions.UploadStorage,
        Permissions.ReadStorage,
        Permissions.DownloadStorage,
        Permissions.ReadApplication,
        Permissions.ViewOwnApplications,
        Permissions.ReadRequirements,
        Permissions.ReadServices,
        Permissions.ReadServiceVariantElements,
        Permissions.ReadSchedules,
        Permissions.ReadTenants
    };

    public async Task<bool> HasPermissionAsync(string permission, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(permission))
        {
            return false;
        }

        if (_currentUserService.IsSuperAdminClaim || _currentUserService.IsAdminClaim || AdministrativeIdentityPolicy.IsAdministrativeEmail(_currentUserService.Email))
        {
            return true;
        }

        if (ApplicationFilingPermissions.Contains(permission) && await CanSubmitApplicationAsync(cancellationToken))
        {
            return true;
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

        if (_currentUserService.IsSuperAdminClaim || _currentUserService.IsAdminClaim || AdministrativeIdentityPolicy.IsAdministrativeEmail(_currentUserService.Email))
        {
            return true;
        }

        if (permissions.Any(p => ApplicationFilingPermissions.Contains(p)) && await CanSubmitApplicationAsync(cancellationToken))
        {
            return true;
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

        if (_currentUserService.IsSuperAdminClaim || _currentUserService.IsAdminClaim || AdministrativeIdentityPolicy.IsAdministrativeEmail(_currentUserService.Email))
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

        if (_currentUserService.IsSuperAdminClaim)
        {
            return true;
        }

        if (_currentUserService.IsAdminClaim && AdministrativeIdentityPolicy.IsAdministrativeRole(role))
        {
            return true;
        }

        if (AdministrativeIdentityPolicy.IsSuperAdminEmail(_currentUserService.Email))
        {
            return true;
        }

        if (AdministrativeIdentityPolicy.IsAdministrativeEmail(_currentUserService.Email) && AdministrativeIdentityPolicy.IsAdministrativeRole(role))
        {
            return true;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            return false;
        }

        if (user.IsSuperAdmin || AdministrativeIdentityPolicy.IsSuperAdminEmail(user.Email))
        {
            return true;
        }

        if (AdministrativeIdentityPolicy.IsAdministrativeEmail(user.Email) && AdministrativeIdentityPolicy.IsAdministrativeRole(role))
        {
            return true;
        }

        var tenantId = _tenantContextService.TenantId;
        if (!tenantId.HasValue)
        {
            var memberships = await (
                from tm in _dbContext.TenantMembers
                join r in _dbContext.Roles on tm.RoleId equals r.Id
                where tm.UserId == user.Id && !tm.IsDeleted && !r.IsDeleted
                select r.Key
            ).ToListAsync(cancellationToken);

            return memberships.Any(k => k.Equals(role, StringComparison.OrdinalIgnoreCase) || (AdministrativeIdentityPolicy.IsAdministrativeRole(role) && AdministrativeIdentityPolicy.IsAdministrativeRole(k)));
        }

        var memberRoles = await (
            from tm in _dbContext.TenantMembers
            join r in _dbContext.Roles on tm.RoleId equals r.Id
            where tm.UserId == user.Id && tm.TenantId == tenantId.Value && !tm.IsDeleted && !r.IsDeleted
            select r.Key
        ).ToListAsync(cancellationToken);

        return memberRoles.Any(k => k.Equals(role, StringComparison.OrdinalIgnoreCase) || (AdministrativeIdentityPolicy.IsAdministrativeRole(role) && AdministrativeIdentityPolicy.IsAdministrativeRole(k)));
    }

    public async Task<bool> IsInternalUserAsync(CancellationToken cancellationToken = default)
    {
        if (_currentUserService.IsSuperAdminClaim || _currentUserService.IsAdminClaim)
        {
            return true;
        }

        if (AdministrativeIdentityPolicy.IsAdministrativeEmail(_currentUserService.Email))
        {
            return true;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            return false;
        }

        if (user.IsSuperAdmin || AdministrativeIdentityPolicy.IsAdministrativeEmail(user.Email))
        {
            return true;
        }

        // An internal user is an active tenant member whose role is NOT external 'client'
        return await (
            from tm in _dbContext.TenantMembers
            join r in _dbContext.Roles on tm.RoleId equals r.Id
            where tm.UserId == user.Id && !tm.IsDeleted && !r.IsDeleted
            where r.Key.ToLower() != "client"
            select tm.Id
        ).AnyAsync(cancellationToken);
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

        var isInternal = await IsInternalUserAsync(cancellationToken);
        if (!isInternal)
        {
            // Public client applicant
            return true;
        }

        // Internal staff account: check if user holds SubmitApplication permission in any active membership
        return await (
            from tm in _dbContext.TenantMembers
            join rp in _dbContext.RolePermissions on tm.RoleId equals rp.RoleId
            where tm.UserId == user.Id && !tm.IsDeleted
            where rp.PermissionKey == Permissions.SubmitApplication
            select rp.Id
        ).AnyAsync(cancellationToken);
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

        // Direct claim/email check for SuperAdmin or Admin
        if (_currentUserService.IsSuperAdminClaim || _currentUserService.IsAdminClaim)
        {
            _cachedPermissions = Permissions.AllKeys.ToList();
            return _cachedPermissions;
        }

        if (AdministrativeIdentityPolicy.IsAdministrativeEmail(_currentUserService.Email))
        {
            _cachedPermissions = Permissions.AllKeys.ToList();
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
                Permissions.DownloadStorage,
                Permissions.ReadChat,
                Permissions.SendChat,
                Permissions.ReadMeetings,
                Permissions.ReceiptsRead,
                Permissions.ReadSchedules,
                Permissions.ReadServiceVariantElements
            };
            return _cachedPermissions;
        }

        // SuperAdmin or Admin user has ALL permissions across the system
        if (user.IsSuperAdmin || AdministrativeIdentityPolicy.IsAdministrativeEmail(user.Email))
        {
            _cachedPermissions = Permissions.AllKeys.ToList();
            return _cachedPermissions;
        }

        try
        {
            var isInternal = await IsInternalUserAsync(cancellationToken);
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
                    Permissions.DownloadStorage,
                    Permissions.ReadChat,
                    Permissions.SendChat,
                    Permissions.ReadMeetings,
                    Permissions.ReceiptsRead,
                    Permissions.ReadSchedules,
                    Permissions.ReadServiceVariantElements
                };
                return _cachedPermissions;
            }

            // Check if user holds an Admin/Administrator role in any active tenant membership
            var memberRoleKeys = await (
                from tm in _dbContext.TenantMembers
                join r in _dbContext.Roles on tm.RoleId equals r.Id
                where tm.UserId == user.Id && !tm.IsDeleted && !r.IsDeleted
                select r.Key
            ).ToListAsync(cancellationToken);

            if (memberRoleKeys.Any(AdministrativeIdentityPolicy.IsAdministrativeRole))
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

            if (dbPermissions.Count == 0 && !tenantId.HasValue)
            {
                // Fallback: if no active tenant specified in request context, load permissions across all active memberships
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
                Permissions.ReadUsers
            };

            foreach (var basePerm in basePermissions)
            {
                if (!dbPermissions.Contains(basePerm))
                {
                    dbPermissions.Add(basePerm);
                }
            }

            var receiptActionPermissions = new[]
            {
                Permissions.ReceiptsBundleEntry,
                Permissions.ReceiptsIssue,
                Permissions.ReceiptsEdit,
                Permissions.ReceiptsCancel,
                Permissions.ReceiptsDeposit,
                Permissions.BankAccountsManage,
                Permissions.CashierReports,
                Permissions.CollectPayment,
                Permissions.ReturnOp
            };

            if (memberRoleKeys.Any(k => k.Equals("cashier", StringComparison.OrdinalIgnoreCase)))
            {
                if (!dbPermissions.Contains(Permissions.ReceiptsRead))
                {
                    dbPermissions.Add(Permissions.ReceiptsRead);
                }
                foreach (var cashierPerm in receiptActionPermissions)
                {
                    if (!dbPermissions.Contains(cashierPerm))
                    {
                        dbPermissions.Add(cashierPerm);
                    }
                }
            }
            else if (receiptActionPermissions.Any(p => dbPermissions.Contains(p)))
            {
                // Anyone granted any Receipt Management action permission by Admin must also have ReceiptsRead
                if (!dbPermissions.Contains(Permissions.ReceiptsRead))
                {
                    dbPermissions.Add(Permissions.ReceiptsRead);
                }
            }

            if (dbPermissions.Contains(Permissions.SubmitApplication) || await CanSubmitApplicationAsync(cancellationToken))
            {
                foreach (var filingPerm in ApplicationFilingPermissions)
                {
                    if (!dbPermissions.Contains(filingPerm))
                    {
                        dbPermissions.Add(filingPerm);
                    }
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
