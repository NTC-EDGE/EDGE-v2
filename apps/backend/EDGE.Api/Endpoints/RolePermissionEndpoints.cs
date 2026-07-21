using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.RolePermissions.Commands;

namespace EDGE.Api.Endpoints;

public static class RolePermissionEndpoints
{
    public static void MapRolePermissionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/rolepermissions").WithTags("RolePermissions");

        group.MapPost("/assign", async (
            AssignPermissionCommand command,
            IValidator<AssignPermissionCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success ? Results.Ok(new { Message = "Permission assigned successfully." }) : Results.BadRequest("Could not assign permission.");
        })
        .WithName("AssignRolePermission")
        .WithTags("RolePermissions")
        .WithSummary("Assign permission to role")
        .WithDescription("Maps a system permission to a target role.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPost("/revoke", async (
            RevokePermissionCommand command,
            IValidator<RevokePermissionCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success ? Results.Ok(new { Message = "Permission revoked successfully." }) : Results.NotFound("Mapping not found.");
        })
        .WithName("RevokeRolePermission")
        .WithTags("RolePermissions")
        .WithSummary("Revoke permission from role")
        .WithDescription("Removes a permission mapping from a role.")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
