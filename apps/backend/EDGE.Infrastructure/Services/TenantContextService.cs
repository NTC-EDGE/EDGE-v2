using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Services;

public class TenantContextService : ITenantContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICurrentUserService _currentUserService;
    private readonly ApplicationDbContext _dbContext;

    public TenantContextService(
        IHttpContextAccessor httpContextAccessor,
        ICurrentUserService currentUserService,
        ApplicationDbContext dbContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public Guid? TenantId
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return null;

            // Extract tenantId strictly from URL route path parameter ({tenantId})
            var routeTenantId = httpContext.GetRouteValue("tenantId")?.ToString();
            if (!string.IsNullOrEmpty(routeTenantId) && Guid.TryParse(routeTenantId, out var tenantIdFromRoute))
            {
                return tenantIdFromRoute;
            }

            return null;
        }
    }

    public async Task<bool> IsUserActiveMemberAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty) return false;

        var authUserId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(authUserId)) return false;

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.AuthUserId == authUserId && !u.IsDeleted, cancellationToken);

        if (user == null) return false;

        // SuperAdmins are granted active access across all tenants
        if (user.IsSuperAdmin) return true;

        // Verify that the user has an active membership in the target tenant
        return await _dbContext.TenantMembers
            .AsNoTracking()
            .AnyAsync(m => m.TenantId == tenantId && m.UserId == user.Id && !m.IsDeleted && m.Tenant.IsActive, cancellationToken);
    }

    public async Task<bool> IsUserActiveMemberOfCurrentTenantAsync(CancellationToken cancellationToken = default)
    {
        var currentTenantId = TenantId;
        if (!currentTenantId.HasValue) return false;

        return await IsUserActiveMemberAsync(currentTenantId.Value, cancellationToken);
    }
}
