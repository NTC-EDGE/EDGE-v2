using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Authorization;

namespace EDGE.Api.Endpoints;

public static class PermissionEndpoints
{
    public static void MapPermissionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/permissions").WithTags("Permissions");

        group.MapGet("/", GetPermissions)
            .WithName("GetPermissions")
            .WithTags("Permissions")
            .WithSummary("Get authorization permissions catalog")
            .WithDescription("Returns categorized permission definitions. Requesting system-level permissions returns 403 Forbidden if user lacks SystemAdmin permission.");
    }

    [HasPermission(Permissions.ReadRoles)]
    public static async Task<IResult> GetPermissions(
        [FromQuery] string? scope = "internal",
        [FromServices] IUserAuthorizationService authService = null!)
    {
        var isAllOrSystem = string.Equals(scope, "all", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(scope, "systemadmin", StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(scope, "system", StringComparison.OrdinalIgnoreCase);

        if (isAllOrSystem)
        {
            var hasSystemAdmin = await authService.HasPermissionAsync(Permissions.SystemAdmin);
            if (!hasSystemAdmin)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status403Forbidden,
                    title: "Forbidden",
                    detail: "Access denied. Requesting system-level permissions requires SystemAdmin permission.");
            }
        }

        var definitions = isAllOrSystem ? Permissions.Definitions : Permissions.InternalPermissions;

        var catalog = definitions.Select(d => new
        {
            key = d.Key,
            category = d.Category,
            label = d.Label,
            scope = d.Scope.ToString().ToLowerInvariant(),
            tag = d.Category,
            description = d.Description
        }).ToList();

        return Results.Ok(catalog);
    }
}
