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
        .WithTags("Tenants")
        .WithSummary("Create new tenant organization")
        .WithDescription("Creates a new Tenant organization, company, or regional branch.")
        .RequireAuthorization();

        tenants.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetAllTenantsQuery());
            return Results.Ok(result);
        })
        .WithName("GetAllTenants")
        .WithTags("Tenants")
        .WithSummary("Retrieve all tenants")
        .WithDescription("Retrieves all Tenant organizations registered across regions.")
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
        .WithTags("Tenants")
        .WithSummary("Retrieve tenant by ID")
        .WithDescription("Retrieves detailed profile information for a specific Tenant by its unique identifier.")
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
        .WithTags("Tenants")
        .WithSummary("Update tenant details")
        .WithDescription("Updates an existing Tenant's name, code, description, or active status.")
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
        .WithTags("Tenants")
        .WithSummary("Delete tenant organization")
        .WithDescription("Deletes a Tenant organization by its unique ID.")
        .RequireAuthorization();

        return group;
    }
}
