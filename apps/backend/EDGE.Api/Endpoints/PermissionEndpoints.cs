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
            .WithSummary("Get all authorization permissions")
            .WithDescription("Returns all available permission keys defined in the system.");
    }

    [HasPermission(Permissions.ReadRoles)]
    public static IResult GetPermissions()
    {
        var keys = Permissions.AllKeys.Select(k => new { Key = k }).ToList();
        return Results.Ok(keys);
    }
}
