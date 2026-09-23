using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration? _configuration;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, IConfiguration? configuration = null)
    {
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
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

            // Fallback for trusted providers (e.g. default Clerk session tokens) that omit the email_verified claim:
            // Strictly restricted to verified/authenticated identities issued by trusted Clerk providers that guarantee
            // email verification during onboarding. Unknown or untrusted external providers do NOT default to true.
            if (!string.IsNullOrWhiteSpace(Email) && (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false))
            {
                return IsTrustedClerkIssuer();
            }

            return false;
        }
    }

    private bool IsTrustedClerkIssuer()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null) return false;

        var issuer = user.FindFirstValue("iss")
                  ?? user.FindFirst("iss")?.Value
                  ?? user.Claims.FirstOrDefault()?.Issuer;

        if (string.IsNullOrWhiteSpace(issuer)) return false;

        var cleanIssuer = issuer.Trim().TrimEnd('/');

        // 1. Check configured Clerk Authority
        var clerkAuthority = _configuration?["Clerk:Authority"]?.Trim().TrimEnd('/');
        if (!string.IsNullOrWhiteSpace(clerkAuthority) &&
            string.Equals(cleanIssuer, clerkAuthority, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // 2. Check configured Clerk ValidIssuers
        var validIssuers = _configuration?.GetSection("Clerk:ValidIssuers").Get<string[]>();
        if (validIssuers != null && validIssuers.Any(vi =>
            !string.IsNullOrWhiteSpace(vi) &&
            string.Equals(cleanIssuer, vi.Trim().TrimEnd('/'), StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        // 3. Domain/Host match with configured Clerk:Authority host or Clerk:TrustedIssuerDomains
        if (Uri.TryCreate(cleanIssuer, UriKind.Absolute, out var uri))
        {
            var host = uri.Host.ToLowerInvariant();

            // Match authority host if authority is a valid URI
            if (!string.IsNullOrWhiteSpace(clerkAuthority) &&
                Uri.TryCreate(clerkAuthority, UriKind.Absolute, out var authorityUri) &&
                string.Equals(host, authorityUri.Host, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Match configured trusted issuer domains / wildcards (e.g. .clerk.accounts.dev, .clerk.com)
            var configuredDomains = _configuration?.GetSection("Clerk:TrustedIssuerDomains").Get<string[]>()
                ?? _configuration?.GetSection("Clerk:TrustedDomains").Get<string[]>();

            if (configuredDomains != null && configuredDomains.Length > 0)
            {
                return configuredDomains.Any(domain =>
                {
                    if (string.IsNullOrWhiteSpace(domain)) return false;
                    var cleanDomain = domain.Trim().ToLowerInvariant();
                    return cleanDomain.StartsWith('.')
                        ? host.EndsWith(cleanDomain)
                        : string.Equals(host, cleanDomain, StringComparison.OrdinalIgnoreCase) || host.EndsWith("." + cleanDomain);
                });
            }
        }

        return false;
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
