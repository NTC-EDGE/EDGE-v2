using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("sub")
                          ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("user_id");

    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email)
                         ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("email")
                         ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("email_address");

    public bool IsEmailVerified
    {
        get
        {
            var verifiedClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("email_verified")
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("email_verification_status");

            if (!string.IsNullOrWhiteSpace(verifiedClaim))
            {
                if (bool.TryParse(verifiedClaim, out var verified))
                {
                    return verified;
                }
                if (string.Equals(verifiedClaim, "verified", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
                if (string.Equals(verifiedClaim, "unverified", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(verifiedClaim, "failed", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(verifiedClaim, "pending", StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }
            }

            // Fallback for providers (e.g. default Clerk session tokens) that omit the email_verified claim:
            // Valid only for cryptographically validated tokens with an authenticated identity and email claim.
            return !string.IsNullOrWhiteSpace(Email) && (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false);
        }
    }

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString()
                             ?? _httpContextAccessor.HttpContext?.Request?.Headers["X-Forwarded-For"].FirstOrDefault();

    public Guid? TenantId
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return null;

            if (httpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var headerValue))
            {
                if (Guid.TryParse(headerValue.ToString(), out var tenantIdFromHeader))
                {
                    return tenantIdFromHeader;
                }
            }

            var routeTenantId = httpContext.GetRouteValue("tenantId")?.ToString();
            if (!string.IsNullOrEmpty(routeTenantId) && Guid.TryParse(routeTenantId, out var tenantIdFromRoute))
            {
                return tenantIdFromRoute;
            }

            return null;
        }
    }
}
