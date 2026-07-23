using MediatR;
using EDGE.Application.Municipalities.Commands.CreateMunicipality;
using EDGE.Application.Municipalities.Commands.UpdateMunicipality;
using EDGE.Application.Municipalities.Commands.DeleteMunicipality;
using EDGE.Application.Municipalities.Queries.GetMunicipalities;
using EDGE.Application.Municipalities.Queries.GetMunicipalityById;
using EDGE.Application.Common.Models;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace EDGE.Api.Endpoints;

public static class MunicipalityEndpoints
{
    public static RouteGroupBuilder MapMunicipalityEndpoints(this RouteGroupBuilder apiGroup)
    {
        var group = apiGroup.MapGroup("municipalities").WithTags("Municipality");

        group.MapGet("/", async (Guid? provinceId, bool? activeOnly, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMunicipalitiesQuery(provinceId, activeOnly));
            return Results.Ok(result);
        })
        .WithName("GetMunicipalities")
        .WithTags("Municipality")
        .WithSummary("Get list of municipalities")
        .WithDescription("Retrieves municipalities filtered by province ID and active status.");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMunicipalityByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetMunicipalityById")
        .WithTags("Municipality")
        .WithSummary("Get municipality by ID")
        .WithDescription("Fetches single municipality record by ID.");

        group.MapPost("/", async (CreateMunicipalityCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/municipalities/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateMunicipality")
        .WithTags("Municipality")
        .WithSummary("Create municipality reference")
        .WithDescription("Creates a new municipality entity.");

        group.MapPut("/{id:guid}", async (Guid id, UpdateMunicipalityCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateMunicipality")
        .WithTags("Municipality")
        .WithSummary("Update municipality details")
        .WithDescription("Updates municipality name, code, or active state.");

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteMunicipalityCommand(id));
            if (!result.Succeeded)
            {
                return result.Message != null && result.Message.Contains("not found")
                    ? Results.NotFound(result)
                    : Results.Conflict(result);
            }
            return Results.Ok(result);
        })
        .WithName("DeleteMunicipality")
        .WithTags("Municipality")
        .WithSummary("Delete municipality reference")
        .WithDescription("Deletes a municipality entity.");

        return apiGroup;
    }
}
