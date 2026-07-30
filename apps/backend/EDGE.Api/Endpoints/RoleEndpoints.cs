using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Roles.Queries;
using EDGE.Application.Roles.Commands;

namespace EDGE.Api.Endpoints;

public static class RoleEndpoints
{
    public static void MapRoleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/roles").WithTags("Roles");

        group.MapGet("/", GetRoles)
            .WithName("GetRoles")
            .WithTags("Roles")
            .WithSummary("Get list of roles")
            .WithDescription("Retrieves system and tenant-specific roles.");

        group.MapGet("/{id:guid}", GetRoleById)
            .WithName("GetRoleById")
            .WithTags("Roles")
            .WithSummary("Get role by ID")
            .WithDescription("Fetches a single role by ID.");

        group.MapPost("/", CreateRole)
            .WithName("CreateRole")
            .WithTags("Roles")
            .WithSummary("Create custom role")
            .WithDescription("Creates a new role for tenant or system access control.");

        group.MapPut("/{id:guid}", UpdateRole)
            .WithName("UpdateRole")
            .WithTags("Roles")
            .WithSummary("Update role definition")
            .WithDescription("Updates role name, key, or scope.");

        group.MapDelete("/{id:guid}", DeleteRole)
            .WithName("DeleteRole")
            .WithTags("Roles")
            .WithSummary("Delete role")
            .WithDescription("Deletes a custom role definition.");
    }

    [HasPermission(Permissions.ReadRoles)]
    public static async Task<IResult> GetRoles(
        [FromQuery] Guid? tenantId = null,
        [FromQuery] bool includeSystemRoles = false,
        IMediator mediator = null!,
        [FromServices] IUserAuthorizationService authService = null!)
    {
        if (includeSystemRoles)
        {
            var hasSystemAdmin = await authService.HasPermissionAsync(Permissions.SystemAdmin);
            if (!hasSystemAdmin)
            {
                return Results.Problem(
                    statusCode: StatusCodes.Status403Forbidden,
                    title: "Forbidden",
                    detail: "Access denied. Requesting system roles requires SystemAdmin permission.");
            }
        }

        var result = await mediator.Send(new GetRolesQuery(tenantId, includeSystemRoles));
        return Results.Ok(result);
    }

    public static async Task<IResult> GetRoleById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetRoleByIdQuery(id));
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.CreateRoles)]
    public static async Task<IResult> CreateRole(
        CreateRoleCommand command,
        IValidator<CreateRoleCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/roles/{result.Id}", result);
    }

    [HasPermission(Permissions.UpdateRoles)]
    public static async Task<IResult> UpdateRole(
        Guid id,
        UpdateRoleCommand command,
        IValidator<UpdateRoleCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest("Route ID does not match request body ID.");
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.DeleteRoles)]
    public static async Task<IResult> DeleteRole(Guid id, IMediator mediator)
    {
        var success = await mediator.Send(new DeleteRoleCommand(id));
        return success ? Results.NoContent() : Results.NotFound();
    }
}
