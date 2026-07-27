using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
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
            .WithSummary("Get all authorization permissions catalog")
            .WithDescription("Returns all available permission keys, labels, and categories defined in the system.");
    }

    [HasPermission(Permissions.ReadRoles)]
    public static IResult GetPermissions()
    {
        var catalog = Permissions.AllKeys.Select(key =>
        {
            var parts = key.Split('.');
            var categoryRaw = parts.Length > 0 ? parts[0] : "general";
            var actionRaw = parts.Length > 1 ? string.Join(".", parts.Skip(1)) : key;

            var category = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(categoryRaw.Replace('_', ' '));
            var label = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(actionRaw.Replace('_', ' '));

            return new
            {
                key,
                category,
                label
            };
        }).ToList();

        return Results.Ok(catalog);
    }
}
