using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Fees.Commands.CreateFee;
using EDGE.Application.Fees.Commands.UpdateFee;
using EDGE.Application.Fees.Commands.SetFeeStatus;
using EDGE.Application.Fees.Commands.DeleteFee;
using EDGE.Application.Fees.Queries;

namespace EDGE.Api.Endpoints;

public record SetFeeStatusRequest(bool IsActive);
public record UpdateFeeRequest(string Code, string Name, string? Description);

public static class FeeEndpoints
{
    public static RouteGroupBuilder MapFeeEndpoints(this RouteGroupBuilder group)
    {
        var fees = group.MapGroup("fees")
            .WithTags("Fees");

        fees.MapGet("/", GetFees)
            .WithName("GetFees")
            .WithSummary("Get all fees")
            .WithDescription("Retrieves a list of all fee master items. Filter by active status using the activeOnly query parameter.");

        fees.MapGet("/{id:guid}", GetFeeById)
            .WithName("GetFeeById")
            .WithSummary("Get fee by ID")
            .WithDescription("Retrieves the details of a specific fee master item by its unique identifier.");

        fees.MapPost("/", CreateFee)
            .WithName("CreateFee")
            .WithSummary("Create a new fee")
            .WithDescription("Creates a new fee record with a unique code, name, and optional description.");

        fees.MapPut("/{id:guid}", UpdateFee)
            .WithName("UpdateFee")
            .WithSummary("Update an existing fee")
            .WithDescription("Updates an existing fee record by its unique identifier.");

        fees.MapPatch("/{id:guid}/status", SetFeeStatus)
            .WithName("SetFeeStatus")
            .WithSummary("Set fee active status")
            .WithDescription("Updates the active status (IsActive) of a fee by its unique identifier passed in the route parameter.");

        fees.MapDelete("/{id:guid}", DeleteFee)
            .WithName("DeleteFee")
            .WithSummary("Delete a fee")
            .WithDescription("Deletes a fee record by its unique identifier.");

        return group;
    }

    public static async Task<IResult> GetFees(
        bool? activeOnly,
        IValidator<GetFeesQuery> validator,
        IMediator mediator)
    {
        var query = new GetFeesQuery(activeOnly);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    public static async Task<IResult> GetFeeById(
        Guid id,
        IValidator<GetFeeByIdQuery> validator,
        IMediator mediator)
    {
        var query = new GetFeeByIdQuery(id);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    public static async Task<IResult> CreateFee(
        CreateFeeCommand command,
        IValidator<CreateFeeCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/fees/{result.Id}", result);
    }

    public static async Task<IResult> UpdateFee(
        Guid id,
        UpdateFeeRequest request,
        IValidator<UpdateFeeCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateFeeCommand(id, request.Code, request.Name, request.Description, null);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    public static async Task<IResult> SetFeeStatus(
        Guid id,
        SetFeeStatusRequest request,
        IValidator<SetFeeStatusCommand> validator,
        IMediator mediator)
    {
        var command = new SetFeeStatusCommand(id, request.IsActive);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    public static async Task<IResult> DeleteFee(
        Guid id,
        IValidator<DeleteFeeCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteFeeCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var success = await mediator.Send(command);
        return success ? Results.NoContent() : Results.NotFound();
    }
}
