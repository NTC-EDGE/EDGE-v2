using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Roles.Queries;
using EDGE.Application.Roles.Commands;

namespace EDGE.Api.Endpoints;

public static class RoleEndpoints
{
    public static void MapRoleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/roles").WithTags("Roles");

        group.MapGet("/", async (Guid? tenantId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRolesQuery(tenantId));
            return Results.Ok(result);
        })
        .WithName("GetRoles")
        .WithTags("Roles")
        .WithSummary("Get list of roles")
        .WithDescription("Retrieves system and tenant-specific roles.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRoleByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetRoleById")
        .WithTags("Roles")
        .WithSummary("Get role by ID")
        .WithDescription("Fetches a single role by ID.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPost("/", async (
            CreateRoleCommand command,
            IValidator<CreateRoleCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/roles/{result.Id}", result);
        })
        .WithName("CreateRole")
        .WithTags("Roles")
        .WithSummary("Create custom role")
        .WithDescription("Creates a new role for tenant or system access control.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateRoleCommand command,
            IValidator<UpdateRoleCommand> validator,
            IMediator mediator) =>
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
        })
        .WithName("UpdateRole")
        .WithTags("Roles")
        .WithSummary("Update role definition")
        .WithDescription("Updates role name, key, or scope.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteRoleCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteRole")
        .WithTags("Roles")
        .WithSummary("Delete role")
        .WithDescription("Deletes a custom role definition.")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
