using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Application.Permissions.Queries;

namespace EDGE.Api.Endpoints;

public static class PermissionEndpoints
{
    public static void MapPermissionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/permissions").WithTags("Permissions");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetPermissionsQuery());
            return Results.Ok(result);
        })
        .WithName("GetPermissions")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
