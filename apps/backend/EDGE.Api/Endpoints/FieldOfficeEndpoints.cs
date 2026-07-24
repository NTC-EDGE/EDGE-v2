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
    public static IEndpointRouteBuilder MapFieldOfficeEndpoints(this IEndpointRouteBuilder app)
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

        group.MapGet("/", async (Guid? regionId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetFieldOfficesQuery(regionId));
            return Results.Ok(result);
        })
        .WithName("GetFieldOffices")
        .WithSummary("Get all field offices")
        .WithDescription("Returns all field offices, optionally filtered by RegionId.");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetFieldOfficeByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetFieldOfficeById")
        .WithSummary("Get field office by ID");

        group.MapPost("/", async (CreateFieldOfficeCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/field-offices/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateFieldOffice")
        .WithSummary("Create a new field office");

        group.MapPut("/{id:guid}", async (Guid id, UpdateFieldOfficeCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateFieldOffice")
        .WithSummary("Update field office");

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteFieldOfficeCommand(id));
            if (!result.Succeeded)
            {
                return result.Message != null && result.Message.Contains("not found")
                    ? Results.NotFound(result)
                    : Results.Conflict(result);
            }
            return Results.Ok(result);
        })
        .WithName("DeleteFieldOffice")
        .WithSummary("Delete a field office")
        .WithDescription("Fails with 409 Conflict if the office has associated applications.");

        return app;
    }
}
