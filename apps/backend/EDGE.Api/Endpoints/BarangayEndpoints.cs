using MediatR;
using EDGE.Application.Barangays.Commands.CreateBarangay;
using EDGE.Application.Barangays.Commands.UpdateBarangay;
using EDGE.Application.Barangays.Commands.DeleteBarangay;
using EDGE.Application.Barangays.Queries.GetBarangays;
using EDGE.Application.Barangays.Queries.GetBarangayById;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class BarangayEndpoints
{
    public static IEndpointRouteBuilder MapBarangayEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/barangays").WithTags("Barangay");

        group.MapGet("/", async (Guid? municipalityId, bool? activeOnly, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetBarangaysQuery(municipalityId, activeOnly));
            return Results.Ok(result);
        })
        .WithName("GetBarangays");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetBarangayByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetBarangayById");

        group.MapPost("/", async (CreateBarangayCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/barangays/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateBarangay");

        group.MapPut("/{id:guid}", async (Guid id, UpdateBarangayCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateBarangay");

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
        .WithName("DeleteBarangay");

        return app;
    }
}
