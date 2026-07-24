using MediatR;
using EDGE.Application.FieldOffices.Commands.CreateFieldOffice;
using EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;
using EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;
using EDGE.Application.FieldOffices.Queries.GetFieldOffices;
using EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;
using EDGE.Application.Common.Models;
using EDGE.Application.FieldOffices.Queries.GetFieldOfficesByTenant;

namespace EDGE.Api.Endpoints;

public static class FieldOfficeEndpoints
{
    public static RouteGroupBuilder MapFieldOfficeEndpoints(this RouteGroupBuilder group)
    {
        app.MapGet("/tenants/{tenantId:guid}/field-offices", async (Guid tenantId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetFieldOfficesByTenantQuery(tenantId));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetFieldOfficesByTenant")
        .WithTags("FieldOffices")
        .WithSummary("Get field offices by tenant organization")
        .WithDescription("Returns all field offices associated with the tenant organization's region.");

        var group = app.MapGroup("/field-offices").WithTags("FieldOffices");

        offices.MapGet("/", async (
            Guid? tenantId,
            IValidator<GetFieldOfficesQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetFieldOfficesQuery(tenantId.GetValueOrDefault());
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetFieldOffices")
        .WithTags("FieldOffices")
        .WithSummary("Retrieve all field offices")
        .WithDescription("Retrieves a list of all field offices for a specific tenant.")
        .RequireAuthorization();

        offices.MapGet("/{id:guid}", async (
            Guid id,
            Guid? tenantId,
            IValidator<GetFieldOfficeByIdQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetFieldOfficeByIdQuery(id, tenantId.GetValueOrDefault());
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return result is not null
                ? Results.Ok(result)
                : Results.NotFound(new { message = $"Field office with ID '{id}' was not found for this tenant." });
        })
        .WithName("GetFieldOfficeById")
        .WithTags("FieldOffices")
        .WithSummary("Retrieve field office by ID")
        .WithDescription("Retrieves the details of a specific field office by its unique ID and tenant ID.")
        .RequireAuthorization();

        offices.MapPost("/", async (
            CreateFieldOfficeCommand command,
            IValidator<CreateFieldOfficeCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/field-offices/{result.Id}", result);
        })
        .WithName("CreateFieldOffice")
        .WithTags("FieldOffices")
        .WithSummary("Create new field office")
        .WithDescription("Creates a new field office record associated with a tenant and region.")
        .RequireAuthorization();

        offices.MapPut("/{id:guid}", async (
            Guid id,
            UpdateFieldOfficeCommand command,
            IValidator<UpdateFieldOfficeCommand> validator,
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

            var result = await mediator.Send(command);
            return result is not null
                ? Results.Ok(result)
                : Results.NotFound(new { message = $"Field office with ID '{id}' was not found for this tenant." });
        })
        .WithName("UpdateFieldOffice")
        .WithTags("FieldOffices")
        .WithSummary("Update field office details")
        .WithDescription("Updates the details of a specific field office.")
        .RequireAuthorization();

        offices.MapDelete("/{id:guid}", async (
            Guid id,
            Guid? tenantId,
            IValidator<DeleteFieldOfficeCommand> validator,
            IMediator mediator) =>
        {
            var command = new DeleteFieldOfficeCommand(id, tenantId.GetValueOrDefault());
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success
                ? Results.NoContent()
                : Results.NotFound(new { message = $"Field office with ID '{id}' was not found or could not be deleted." });
        })
        .WithName("DeleteFieldOffice")
        .WithTags("FieldOffices")
        .WithSummary("Delete a field office")
        .WithDescription("Deletes a field office record by its unique ID and tenant ID.")
        .RequireAuthorization();

        return group;
    }
}
