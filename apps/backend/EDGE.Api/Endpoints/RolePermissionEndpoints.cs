using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Infrastructure.Persistence;
using EDGE.Application.RolePermissions.Commands;
using EDGE.Application.RolePermissions.Queries.GetRolePermissions;

namespace EDGE.Api.Endpoints;

public static class RolePermissionEndpoints
{
    public static void MapRolePermissionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/role-permissions").WithTags("RolePermissions");

        group.MapGet("/{roleId:guid}", GetRolePermissions)
            .WithName("GetRolePermissions")
            .WithTags("RolePermissions")
            .WithSummary("Get permission keys for role")
            .WithDescription("Retrieves assigned permission keys for a specific role.");

        group.MapPost("/assign", AssignRolePermission)
            .WithName("AssignRolePermission")
            .WithTags("RolePermissions")
            .WithSummary("Assign permission to role")
            .WithDescription("Maps a system permission to a target role.");

        group.MapPost("/revoke", RevokeRolePermission)
            .WithName("RevokeRolePermission")
            .WithTags("RolePermissions")
            .WithSummary("Revoke permission from role")
            .WithDescription("Removes a permission mapping from a role.");

        group.MapPost("/reset", ResetRolePermissions)
            .WithName("ResetRolePermissions")
            .WithTags("RolePermissions")
            .WithSummary("Reset seeded role permissions")
            .WithDescription("Resets default seeded roles to their initial permission configurations.");
    }

    [HasPermission(Permissions.ReadRoles)]
    public static async Task<IResult> GetRolePermissions(Guid roleId, IMediator mediator)
    {
        var permissionKeys = await mediator.Send(new GetRolePermissionsQuery(roleId));
        return Results.Ok(new { succeeded = true, data = permissionKeys });
    }

    [HasPermission(Permissions.AssignRolePermissions)]
    public static async Task<IResult> AssignRolePermission(
        AssignPermissionCommand command,
        IValidator<AssignPermissionCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var success = await mediator.Send(command);
        return success ? Results.Ok(new { Message = "Permission assigned successfully." }) : Results.BadRequest("Could not assign permission.");
    }

    [HasPermission(Permissions.RevokeRolePermissions)]
    public static async Task<IResult> RevokeRolePermission(
        RevokePermissionCommand command,
        IValidator<RevokePermissionCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var success = await mediator.Send(command);
        return success ? Results.Ok(new { Message = "Permission revoked successfully." }) : Results.NotFound("Mapping not found.");
    }

    [HasPermission(Permissions.AssignRolePermissions)]
    public static async Task<IResult> ResetRolePermissions([FromServices] ApplicationDbContext context)
    {
        await RolePermissionDataSeeder.SeedAsync(context, forceResetPermissions: true);
        return Results.Ok(new { succeeded = true, message = "Seeded role permissions have been successfully reset." });
    }
}
