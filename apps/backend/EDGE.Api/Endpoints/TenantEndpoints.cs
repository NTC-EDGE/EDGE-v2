using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Tenants.Commands;
using EDGE.Application.Tenants.Queries;

namespace EDGE.Api.Endpoints;

public static class TenantEndpoints
{
    public static void MapTenantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/tenants").WithTags("Tenants");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTenantsQuery());
            return Results.Ok(result);
        })
        .WithName("GetTenants")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTenantByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetTenantById")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPost("/", async (
            CreateTenantCommand command,
            IValidator<CreateTenantCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/tenants/{result.Id}", result);
        })
        .WithName("CreateTenant")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateTenantCommand command,
            IValidator<UpdateTenantCommand> validator,
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
        .WithName("UpdateTenant")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteTenantCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteTenant")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
