using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Services;

public class TenantContextService : ITenantContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICurrentUserService _currentUserService;
    private readonly ApplicationDbContext _dbContext;

    private User? _cachedUser;
    private bool _userLoaded;
    private readonly Dictionary<Guid, bool> _membershipCache = new();
    private List<Guid>? _cachedActiveTenantIds;

    public TenantContextService(
        IHttpContextAccessor httpContextAccessor,
        ICurrentUserService currentUserService,
        ApplicationDbContext dbContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    private async Task<User?> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        if (_userLoaded)
        {
            return _cachedUser;
        }

        var authUserId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(authUserId))
        {
            _userLoaded = true;
            _cachedUser = null;
            return null;
        }

        _cachedUser = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.AuthUserId == authUserId && !u.IsDeleted, cancellationToken);

        _userLoaded = true;
        return _cachedUser;
    }

    public Guid? TenantId
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return null;

            // 1. Check {tenantId} in route path parameters
            var routeTenantId = httpContext.GetRouteValue("tenantId")?.ToString();
            if (!string.IsNullOrEmpty(routeTenantId) && Guid.TryParse(routeTenantId, out var tenantIdFromRoute))
            {
                return tenantIdFromRoute;
            }

            // 2. Check {id} in route path if the URL path contains /tenants/
            var path = httpContext.Request.Path.Value ?? string.Empty;
            if (path.Contains("/tenants/", StringComparison.OrdinalIgnoreCase))
            {
                var routeId = httpContext.GetRouteValue("id")?.ToString();
                if (!string.IsNullOrEmpty(routeId) && Guid.TryParse(routeId, out var tenantIdFromIdRoute))
                {
                    return tenantIdFromIdRoute;
                }
            }

            // 3. Check query string parameters (?tenantId=... or ?tenant_id=...)
            if (httpContext.Request.Query.TryGetValue("tenantId", out var queryTenantId) &&
                Guid.TryParse(queryTenantId.ToString(), out var parsedQueryTenantId))
            {
                return parsedQueryTenantId;
            }

            if (httpContext.Request.Query.TryGetValue("tenant_id", out var queryTenantIdSnake) &&
                Guid.TryParse(queryTenantIdSnake.ToString(), out var parsedQueryTenantIdSnake))
            {
                return parsedQueryTenantIdSnake;
            }

            // 4. Check request headers (X-Tenant-Id / x-tenant-id)
            if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var headerTenantId) &&
                Guid.TryParse(headerTenantId.ToString(), out var parsedHeaderTenantId))
            {
                return parsedHeaderTenantId;
            }

            return null;
        }
    }

    public async Task<bool> IsCurrentUserSuperAdminAsync(CancellationToken cancellationToken = default)
    {
        var user = await GetCurrentUserAsync(cancellationToken);
        return user?.IsSuperAdmin == true;
    }

    public async Task<bool> IsUserActiveMemberAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty) return false;

        if (_membershipCache.TryGetValue(tenantId, out var cachedResult))
        {
            return cachedResult;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            _membershipCache[tenantId] = false;
            return false;
        }

        // SuperAdmins are granted active access across all tenants
        if (user.IsSuperAdmin)
        {
            _membershipCache[tenantId] = true;
            return true;
        }

        // Verify that the user has an active membership in the target tenant
        var isMember = await _dbContext.TenantMembers
            .AsNoTracking()
            .AnyAsync(m => m.TenantId == tenantId && m.UserId == user.Id && !m.IsDeleted && m.Tenant.IsActive, cancellationToken);

        _membershipCache[tenantId] = isMember;
        return isMember;
    }

    public async Task<bool> IsUserActiveMemberOfCurrentTenantAsync(CancellationToken cancellationToken = default)
    {
        var currentTenantId = TenantId;
        if (!currentTenantId.HasValue) return false;

        return await IsUserActiveMemberAsync(currentTenantId.Value, cancellationToken);
    }

    public async Task<List<Guid>> GetUserActiveTenantIdsAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedActiveTenantIds != null)
        {
            return _cachedActiveTenantIds;
        }

        var user = await GetCurrentUserAsync(cancellationToken);
        if (user == null)
        {
            _cachedActiveTenantIds = [];
            return _cachedActiveTenantIds;
        }

        if (user.IsSuperAdmin)
        {
            _cachedActiveTenantIds = await _dbContext.Tenants
                .AsNoTracking()
                .Where(t => !t.IsDeleted && t.IsActive)
                .Select(t => t.Id)
                .ToListAsync(cancellationToken);

            return _cachedActiveTenantIds;
        }

        _cachedActiveTenantIds = await _dbContext.TenantMembers
            .AsNoTracking()
            .Where(m => m.UserId == user.Id && !m.IsDeleted && m.Tenant.IsActive)
            .Select(m => m.TenantId)
            .Distinct()
            .ToListAsync(cancellationToken);

        return _cachedActiveTenantIds;
    }

    public async Task EnsureUserActiveMemberAsync(Guid tenantId, string? customErrorMessage = null, CancellationToken cancellationToken = default)
    {
        var isMember = await IsUserActiveMemberAsync(tenantId, cancellationToken);
        if (!isMember)
        {
            throw new UnauthorizedAccessException(customErrorMessage ?? $"You are not authorized to access or modify resources for regional tenant '{tenantId}'.");
        }
    }
}
