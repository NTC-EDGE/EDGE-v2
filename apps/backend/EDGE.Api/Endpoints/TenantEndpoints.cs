using FluentValidation;
using MediatR;
using EDGE.Application.Tenants.Commands;
using EDGE.Application.Tenants.Queries;

namespace EDGE.Api.Endpoints;

public static class TenantEndpoints
{
    public static RouteGroupBuilder MapTenantEndpoints(this RouteGroupBuilder group)
    {
        var tenants = group.MapGroup("tenants")
            .WithTags("Tenants");

        tenants.MapPost("/", async (
            CreateTenantCommand command,
            IValidator<CreateTenantCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Created($"/api/v2/tenants/{result.Id}", result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { message = ex.Message });
            }
        })
        .WithName("CreateTenant")
        .WithDescription("Create a new Tenant (organization, company, or branch)")
        .RequireAuthorization();

        tenants.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetAllTenantsQuery());
            return Results.Ok(result);
        })
        .WithName("GetAllTenants")
        .WithDescription("Retrieve all Tenants")
        .RequireAuthorization();

        tenants.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            try
            {
                var result = await mediator.Send(new GetTenantByIdQuery(id));
                return Results.Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound(new { message = $"Tenant with ID '{id}' was not found." });
            }
        })
        .WithName("GetTenantById")
        .WithDescription("Retrieve a specific Tenant by ID")
        .RequireAuthorization();

        tenants.MapPut("/{id:guid}", async (
            Guid id,
            UpdateTenantCommand command,
            IValidator<UpdateTenantCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(new { message = "The path ID does not match the request body ID." });
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound(new { message = $"Tenant with ID '{id}' was not found." });
            }
            catch (InvalidOperationException ex)
            {
                return Results.Conflict(new { message = ex.Message });
            }
        })
        .WithName("UpdateTenant")
        .WithDescription("Update an existing Tenant's details")
        .RequireAuthorization();

        tenants.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            try
            {
                await mediator.Send(new DeleteTenantCommand(id));
                return Results.NoContent();
            }
            catch (KeyNotFoundException)
            {
                return Results.NotFound(new { message = $"Tenant with ID '{id}' was not found." });
            }
        })
        .WithName("DeleteTenant")
        .WithDescription("Delete a Tenant by ID")
        .RequireAuthorization();

        return group;
    }
}
