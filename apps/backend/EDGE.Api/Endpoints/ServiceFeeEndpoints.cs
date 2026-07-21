using MediatR;
using FluentValidation;
using EDGE.Application.ServiceFees.Commands.CreateServiceFee;
using EDGE.Application.ServiceFees.Commands.UpdateServiceFee;
using EDGE.Application.ServiceFees.Commands.SetServiceFeeStatus;
using EDGE.Application.ServiceFees.Commands.DeleteServiceFee;
using EDGE.Application.ServiceFees.Queries;

namespace EDGE.Api.Endpoints;

public record SetServiceFeeStatusRequest(bool IsActive);

public static class ServiceFeeEndpoints
{
    public static void MapServiceFeeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/service-fees").WithTags("ServiceFees");

        group.MapGet("/", async (
            Guid? serviceId,
            Guid? feeId,
            bool? activeOnly,
            IValidator<GetServiceFeesQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetServiceFeesQuery(serviceId, feeId, activeOnly);
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetServiceFees")
        .WithSummary("Get all service fees")
        .WithDescription("Retrieves a list of service fee mappings. Optionally filter by serviceId, feeId, or activeOnly.");

        group.MapGet("/{id:guid}", async (
            Guid id,
            IValidator<GetServiceFeeByIdQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetServiceFeeByIdQuery(id);
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetServiceFeeById")
        .WithSummary("Get service fee by ID")
        .WithDescription("Retrieves the details of a specific service fee assignment by its unique identifier.");

        group.MapPost("/", async (
            CreateServiceFeeCommand command,
            IValidator<CreateServiceFeeCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/service-fees/{result.Id}", result);
        })
        .WithName("CreateServiceFee")
        .WithSummary("Create a service fee")
        .WithDescription("Assigns a fee to a service with a specified monetary amount.");

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateServiceFeeCommand command,
            IValidator<UpdateServiceFeeCommand> validator,
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
        .WithName("UpdateServiceFee")
        .WithSummary("Update a service fee")
        .WithDescription("Updates a service fee assignment and its monetary amount.");

        group.MapPatch("/{id:guid}/status", async (
            Guid id,
            SetServiceFeeStatusRequest request,
            IValidator<SetServiceFeeStatusCommand> validator,
            IMediator mediator) =>
        {
            var command = new SetServiceFeeStatusCommand(id, request.IsActive);
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("SetServiceFeeStatus")
        .WithSummary("Set service fee active status")
        .WithDescription("Updates the active status (IsActive) of a service fee by its unique identifier passed in the route parameter.");

        group.MapDelete("/{id:guid}", async (
            Guid id,
            IValidator<DeleteServiceFeeCommand> validator,
            IMediator mediator) =>
        {
            var command = new DeleteServiceFeeCommand(id);
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteServiceFee")
        .WithSummary("Delete a service fee")
        .WithDescription("Deletes a service fee mapping by its unique identifier.");
    }
}
