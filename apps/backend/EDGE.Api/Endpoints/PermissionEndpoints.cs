using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;

namespace EDGE.Api.Endpoints;

public static class PermissionEndpoints
{
    public static void MapPermissionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/permissions").WithTags("Permissions");

        group.MapGet("/", () =>
        {
            var keys = Permissions.AllKeys.Select(k => new { Key = k }).ToList();
            return Results.Ok(keys);
        })
        .WithName("GetPermissions")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
