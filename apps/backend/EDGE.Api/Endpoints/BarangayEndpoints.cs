using MediatR;
using EDGE.Application.Barangays.Commands.CreateBarangay;
using EDGE.Application.Barangays.Commands.UpdateBarangay;
using EDGE.Application.Barangays.Commands.DeleteBarangay;
using EDGE.Application.Barangays.Queries.GetBarangays;
using EDGE.Application.Barangays.Queries.GetBarangayById;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace EDGE.Api.Endpoints;

public static class BarangayEndpoints
{
    public static RouteGroupBuilder MapBarangayEndpoints(this RouteGroupBuilder apiGroup)
    {
        var group = apiGroup.MapGroup("barangays").WithTags("Barangay");

        group.MapGet("/", async (Guid? municipalityId, bool? activeOnly, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetBarangaysQuery(municipalityId, activeOnly));
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithName("GetBarangays")
        .WithTags("Barangay")
        .WithSummary("Get list of barangays")
        .WithDescription("Retrieves barangays with optional filtering by municipality ID and active status.");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetBarangayByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .RequireAuthorization()
        .WithName("GetBarangayById")
        .WithTags("Barangay")
        .WithSummary("Get barangay details by ID")
        .WithDescription("Fetches single barangay reference record by ID.");

        group.MapPost("/", async (CreateBarangayCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/barangays/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .RequireAuthorization(new HasPermissionAttribute(Permissions.SystemAdmin))
        .WithName("CreateBarangay")
        .WithTags("Barangay")
        .WithSummary("Create new barangay")
        .WithDescription("Creates a new geographic barangay reference entity.");

        group.MapPut("/{id:guid}", async (Guid id, UpdateBarangayCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .RequireAuthorization(new HasPermissionAttribute(Permissions.SystemAdmin))
        .WithName("UpdateBarangay")
        .WithTags("Barangay")
        .WithSummary("Update barangay reference")
        .WithDescription("Updates details, code, or active status of a barangay.");

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteBarangayCommand(id));
            if (!result.Succeeded)
            {
                return result.Message != null && result.Message.Contains("not found")
                    ? Results.NotFound(result)
                    : Results.Conflict(result);
            }
            return Results.Ok(result);
        })
        .RequireAuthorization(new HasPermissionAttribute(Permissions.SystemAdmin))
        .WithName("DeleteBarangay")
        .WithTags("Barangay")
        .WithSummary("Delete barangay reference")
        .WithDescription("Deletes a barangay reference record if no dependent records exist.");

        return apiGroup;
    }
}
