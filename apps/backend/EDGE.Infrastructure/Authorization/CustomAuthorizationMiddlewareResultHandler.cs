using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Authorization;

namespace EDGE.Infrastructure.Authorization;

/// <summary>
/// Custom ASP.NET Core Authorization Middleware Result Handler.
/// Formats 403 Forbidden responses with clear, actionable JSON payloads detailing missing permissions or required roles,
/// and logs diagnostic warnings for operations monitoring.
/// </summary>
public class CustomAuthorizationMiddlewareResultHandler : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler _defaultHandler = new();
    private readonly ILogger<CustomAuthorizationMiddlewareResultHandler> _logger;

    public CustomAuthorizationMiddlewareResultHandler(ILogger<CustomAuthorizationMiddlewareResultHandler> logger)
    {
        _logger = logger;
    }

    public async Task HandleAsync(
        RequestDelegate next,
        HttpContext context,
        AuthorizationPolicy policy,
        PolicyAuthorizationResult authorizeResult)
    {
        if (authorizeResult.Forbidden)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";

            var requiredPermissions = policy.Requirements
                .OfType<PermissionRequirement>()
                .Select(r => r.Permission)
                .ToList();

            var requiredRoles = policy.Requirements
                .OfType<RoleRequirement>()
                .Select(r => r.Role)
                .ToList();

            _logger.LogWarning(
                "Access Forbidden (403): User '{User}' was denied access to {Method} {Path}. Missing permissions: [{Permissions}], Required roles: [{Roles}].",
                context.User?.Identity?.Name ?? context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Anonymous",
                context.Request.Method,
                context.Request.Path,
                string.Join(", ", requiredPermissions),
                string.Join(", ", requiredRoles)
            );

            string detail;
            if (requiredPermissions.Count > 0)
            {
                var permList = string.Join(", ", requiredPermissions);
                detail = $"Access Denied: Your account does not have the required permission ({permList}) to perform this action. Please contact your system administrator if you need access.";
            }
            else if (requiredRoles.Count > 0)
            {
                var roleList = string.Join(", ", requiredRoles);
                detail = $"Access Denied: This feature is restricted to the '{roleList}' role. Please make sure you are signed in with an authorized role or contact your administrator.";
            }
            else
            {
                detail = "Access Denied: You do not have permission to access this resource or perform this action. Please contact your system administrator.";
            }

            var responsePayload = new
            {
                succeeded = false,
                statusCode = StatusCodes.Status403Forbidden,
                title = "Access Denied",
                detail,
                requiredPermissions,
                requiredRoles
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(responsePayload));
            return;
        }

        // Fall back to default handler for Challenged (401) or Succeeded authorization
        await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);
    }
}
