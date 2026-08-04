using MediatR;
using EDGE.Application.Provinces.Commands.CreateProvince;
using EDGE.Application.Provinces.Commands.UpdateProvince;
using EDGE.Application.Provinces.Commands.DeleteProvince;
using EDGE.Application.Provinces.Queries.GetProvinces;
using EDGE.Application.Provinces.Queries.GetProvinceById;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace EDGE.Api.Endpoints;

public static class ProvinceEndpoints
{
    public static RouteGroupBuilder MapProvinceEndpoints(this RouteGroupBuilder apiGroup)
    {
        var group = apiGroup.MapGroup("provinces").WithTags("Province");

        group.MapGet("/", async (Guid? regionId, bool? activeOnly, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetProvincesQuery(regionId, activeOnly));
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithName("GetProvinces")
        .WithTags("Province")
        .WithSummary("Get list of provinces")
        .WithDescription("Retrieves provinces filtered by region ID and active status.");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetProvinceByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .RequireAuthorization()
        .WithName("GetProvinceById")
        .WithTags("Province")
        .WithSummary("Get province details by ID")
        .WithDescription("Fetches a single province by its unique ID.");

        group.MapPost("/", async (CreateProvinceCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/provinces/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .RequireAuthorization(new HasPermissionAttribute(Permissions.SystemAdmin))
        .WithName("CreateProvince")
        .WithTags("Province")
        .WithSummary("Create province reference")
        .WithDescription("Creates a new province record under a region.");

        group.MapPut("/{id:guid}", async (Guid id, UpdateProvinceCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .RequireAuthorization(new HasPermissionAttribute(Permissions.SystemAdmin))
        .WithName("UpdateProvince")
        .WithTags("Province")
        .WithSummary("Update province details")
        .WithDescription("Updates province properties, region binding, or status.");

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteProvinceCommand(id));
            if (!result.Succeeded)
            {
                return result.Message != null && result.Message.Contains("not found")
                    ? Results.NotFound(result)
                    : Results.Conflict(result);
            }
            return Results.Ok(result);
        })
        .RequireAuthorization(new HasPermissionAttribute(Permissions.SystemAdmin))
        .WithName("DeleteProvince")
        .WithTags("Province")
        .WithSummary("Delete province reference")
        .WithDescription("Deletes a province record.");

        return apiGroup;
    }
}
