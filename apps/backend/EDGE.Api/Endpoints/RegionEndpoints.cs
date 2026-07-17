using MediatR;
using EDGE.Application.Regions.Commands.CreateRegion;
using EDGE.Application.Regions.Commands.UpdateRegion;
using EDGE.Application.Regions.Commands.DeleteRegion;
using EDGE.Application.Regions.Queries.GetRegions;
using EDGE.Application.Regions.Queries.GetRegionById;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class RegionEndpoints
{
    public static IEndpointRouteBuilder MapRegionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/regions").WithTags("Region");

        group.MapGet("/", async (bool? activeOnly, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRegionsQuery(activeOnly));
            return Results.Ok(result);
        })
        .WithName("GetRegions");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRegionByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetRegionById");

        group.MapPost("/", async (CreateRegionCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/regions/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateRegion");

        group.MapPut("/{id:guid}", async (Guid id, UpdateRegionCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateRegion");

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteRegionCommand(id));
            if (!result.Succeeded)
            {
                return result.Message != null && result.Message.Contains("not found")
                    ? Results.NotFound(result)
                    : Results.Conflict(result);
            }
            return Results.Ok(result);
        })
        .WithName("DeleteRegion");

        return app;
    }
}
