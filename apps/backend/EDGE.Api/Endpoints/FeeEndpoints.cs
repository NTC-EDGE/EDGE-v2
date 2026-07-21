using MediatR;
using FluentValidation;
using EDGE.Application.Fees.Commands.CreateFee;
using EDGE.Application.Fees.Commands.UpdateFee;
using EDGE.Application.Fees.Commands.SetFeeStatus;
using EDGE.Application.Fees.Commands.DeleteFee;
using EDGE.Application.Fees.Queries;

namespace EDGE.Api.Endpoints;

public record SetFeeStatusRequest(bool IsActive);

public static class FeeEndpoints
{
    public static void MapFeeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/fees").WithTags("Fees");

        group.MapGet("/", async (
            bool? activeOnly,
            IValidator<GetFeesQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetFeesQuery(activeOnly);
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetFees")
        .WithSummary("Get all fees")
        .WithDescription("Retrieves a list of all fee master items. Filter by active status using the activeOnly query parameter.");

        group.MapGet("/{id:guid}", async (
            Guid id,
            IValidator<GetFeeByIdQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetFeeByIdQuery(id);
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetFeeById")
        .WithSummary("Get fee by ID")
        .WithDescription("Retrieves the details of a specific fee master item by its unique identifier.");

        group.MapPost("/", async (
            CreateFeeCommand command,
            IValidator<CreateFeeCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/fees/{result.Id}", result);
        })
        .WithName("CreateFee")
        .WithSummary("Create a new fee")
        .WithDescription("Creates a new fee record with a unique code, name, and optional description.");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateFeeCommand command,
            IValidator<UpdateFeeCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest("Route ID does not match request body ID.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("UpdateFee")
        .WithSummary("Update an existing fee")
        .WithDescription("Updates an existing fee record by its unique identifier.");

        group.MapPatch("/{id:guid}/status", async (
            Guid id,
            SetFeeStatusRequest request,
            IValidator<SetFeeStatusCommand> validator,
            IMediator mediator) =>
        {
            var command = new SetFeeStatusCommand(id, request.IsActive);
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("SetFeeStatus")
        .WithSummary("Set fee active status")
        .WithDescription("Updates the active status (IsActive) of a fee by its unique identifier passed in the route parameter.");

        group.MapDelete("/{id:guid}", async (
            Guid id,
            IValidator<DeleteFeeCommand> validator,
            IMediator mediator) =>
        {
            var command = new DeleteFeeCommand(id);
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteFee")
        .WithSummary("Delete a fee")
        .WithDescription("Deletes a fee record by its unique identifier.");
    }
}
