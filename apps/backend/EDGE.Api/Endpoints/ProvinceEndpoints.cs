using MediatR;
using EDGE.Application.Provinces.Commands.CreateProvince;
using EDGE.Application.Provinces.Commands.UpdateProvince;
using EDGE.Application.Provinces.Commands.DeleteProvince;
using EDGE.Application.Provinces.Queries.GetProvinces;
using EDGE.Application.Provinces.Queries.GetProvinceById;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class ProvinceEndpoints
{
    public static IEndpointRouteBuilder MapProvinceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/provinces").WithTags("Province");

        group.MapGet("/", async (Guid? regionId, bool? activeOnly, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetProvincesQuery(regionId, activeOnly));
            return Results.Ok(result);
        })
        .WithName("GetProvinces");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetProvinceByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetProvinceById");

        group.MapPost("/", async (CreateProvinceCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/provinces/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateProvince");

        group.MapPut("/{id:guid}", async (Guid id, UpdateProvinceCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateProvince");

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
        .WithName("DeleteProvince");

        return app;
    }
}
