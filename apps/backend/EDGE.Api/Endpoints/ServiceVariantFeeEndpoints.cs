using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.ServiceVariantFees.Commands.CreateServiceVariantFee;
using EDGE.Application.ServiceVariantFees.Commands.UpdateServiceVariantFee;
using EDGE.Application.ServiceVariantFees.Commands.DeleteServiceVariantFee;
using EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFees;
using EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFeeById;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Api.Endpoints;

public record UpdateServiceVariantFeeRequest(Guid ServiceVariantId, Guid FeeId, decimal Amount);

public static class ServiceVariantFeeEndpoints
{
    public static RouteGroupBuilder MapServiceVariantFeeEndpoints(this RouteGroupBuilder group)
    {
        var fees = group.MapGroup("service-variant-fees")
            .WithTags("Service Variant Fees");

        fees.MapGet("/", GetServiceVariantFees)
            .WithName("GetServiceVariantFees")
            .WithSummary("Get all service variant fees")
            .WithDescription("Retrieves a list of all service variant fees. Filter by ServiceVariantId using query parameter.")
            .Produces<List<ServiceVariantFeeDto>>(StatusCodes.Status200OK);

        fees.MapGet("/{id:guid}", GetServiceVariantFeeById)
            .WithName("GetServiceVariantFeeById")
            .WithSummary("Get service variant fee by ID")
            .WithDescription("Retrieves details of a specific service variant fee by its ID.")
            .Produces<ServiceVariantFeeDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        fees.MapPost("/", CreateServiceVariantFee)
            .WithName("CreateServiceVariantFee")
            .WithSummary("Create a new service variant fee")
            .WithDescription("Creates a new service variant fee record.")
            .Produces<ServiceVariantFeeDto>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest);

        fees.MapPut("/{id:guid}", UpdateServiceVariantFee)
            .WithName("UpdateServiceVariantFee")
            .WithSummary("Update an existing service variant fee")
            .WithDescription("Updates an existing service variant fee record.")
            .Produces<ServiceVariantFeeDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        fees.MapDelete("/{id:guid}", DeleteServiceVariantFee)
            .WithName("DeleteServiceVariantFee")
            .WithSummary("Delete a service variant fee")
            .WithDescription("Deletes a service variant fee record.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    public static async Task<IResult> GetServiceVariantFees(
        Guid? serviceVariantId,
        IValidator<GetServiceVariantFeesQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantFeesQuery(serviceVariantId);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    public static async Task<IResult> GetServiceVariantFeeById(
        Guid id,
        IValidator<GetServiceVariantFeeByIdQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantFeeByIdQuery(id);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    public static async Task<IResult> CreateServiceVariantFee(
        CreateServiceVariantFeeCommand command,
        IValidator<CreateServiceVariantFeeCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/service-variant-fees/{result.Id}", result);
    }

    public static async Task<IResult> UpdateServiceVariantFee(
        Guid id,
        UpdateServiceVariantFeeRequest request,
        IValidator<UpdateServiceVariantFeeCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateServiceVariantFeeCommand(id, request.ServiceVariantId, request.FeeId, request.Amount);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    public static async Task<IResult> DeleteServiceVariantFee(
        Guid id,
        IValidator<DeleteServiceVariantFeeCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteServiceVariantFeeCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var success = await mediator.Send(command);
        return success ? Results.NoContent() : Results.NotFound();
    }
}
