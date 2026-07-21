using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;

namespace EDGE.Infrastructure.Services;

public class TenantContextService : ITenantContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantContextService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return null;

            // 1. Check X-Tenant-Id request header
            if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var headerValue))
            {
                if (Guid.TryParse(headerValue.ToString(), out var tenantIdFromHeader))
                {
                    return tenantIdFromHeader;
                }
            }

            // 2. Check route parameter {tenantId}
            var routeTenantId = httpContext.GetRouteValue("tenantId")?.ToString();
            if (!string.IsNullOrEmpty(routeTenantId) && Guid.TryParse(routeTenantId, out var tenantIdFromRoute))
            {
                return tenantIdFromRoute;
            }

            return null;
        }
    }
}
