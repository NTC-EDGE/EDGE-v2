using MediatR;
using FluentValidation;
using EDGE.Application.ServiceVariantElementFees.Commands.CreateServiceVariantElementFee;
using EDGE.Application.ServiceVariantElementFees.Commands.UpdateServiceVariantElementFee;
using EDGE.Application.ServiceVariantElementFees.Commands.DeleteServiceVariantElementFee;
using EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;
using EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFeeById;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

namespace EDGE.Api.Endpoints;

public record UpdateServiceVariantElementFeeRequest(
    Guid ServiceVariantId,
    Guid ElementId,
    Guid FeeId,
    decimal Amount
);

public static class ServiceVariantElementFeeEndpoints
{
    public static RouteGroupBuilder MapServiceVariantElementFeeEndpoints(this RouteGroupBuilder group)
    {
        var fees = group.MapGroup("service-variant-element-fees")
            .WithTags("Service Variant Element Fees");

        fees.MapGet("/", GetServiceVariantElementFees)
            .WithName("GetServiceVariantElementFees")
            .WithSummary("Get all service variant element fees")
            .WithDescription("Retrieves a list of all service variant element fees grouped and paginated by ServiceVariant.")
            .Produces<PaginatedApiResponse<ServiceVariantElementFeeGroupDto>>(StatusCodes.Status200OK);

        fees.MapGet("/{id:guid}", GetServiceVariantElementFeeById)
            .WithName("GetServiceVariantElementFeeById")
            .WithSummary("Get service variant element fee by ID")
            .WithDescription("Retrieves details of a specific service variant element fee by its ID.")
            .Produces<ServiceVariantElementFeeDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        fees.MapPost("/", CreateServiceVariantElementFee)
            .WithName("CreateServiceVariantElementFee")
            .WithSummary("Create a new service variant element fee")
            .WithDescription("Creates a new service variant element fee record.")
            .Produces<ServiceVariantElementFeeDto>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest);

        fees.MapPut("/{id:guid}", UpdateServiceVariantElementFee)
            .WithName("UpdateServiceVariantElementFee")
            .WithSummary("Update an existing service variant element fee")
            .WithDescription("Updates an existing service variant element fee record.")
            .Produces<ServiceVariantElementFeeDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        fees.MapDelete("/{id:guid}", DeleteServiceVariantElementFee)
            .WithName("DeleteServiceVariantElementFee")
            .WithSummary("Delete a service variant element fee")
            .WithDescription("Deletes a service variant element fee record.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetServiceVariantElementFees(
        Guid? serviceVariantId,
        Guid? elementId,
        int? pageNumber,
        int? pageSize,
        string? searchTerm,
        IValidator<GetServiceVariantElementFeesQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantElementFeesQuery(serviceVariantId, elementId, pageNumber, pageSize, searchTerm);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetServiceVariantElementFeeById(
        Guid id,
        IValidator<GetServiceVariantElementFeeByIdQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantElementFeeByIdQuery(id);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> CreateServiceVariantElementFee(
        CreateServiceVariantElementFeeCommand command,
        IValidator<CreateServiceVariantElementFeeCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/service-variant-element-fees/{result.Id}", result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateServiceVariantElementFee(
        Guid id,
        UpdateServiceVariantElementFeeRequest request,
        IValidator<UpdateServiceVariantElementFeeCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateServiceVariantElementFeeCommand(
            id,
            request.ServiceVariantId,
            request.ElementId,
            request.FeeId,
            request.Amount
        );
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> DeleteServiceVariantElementFee(
        Guid id,
        IValidator<DeleteServiceVariantElementFeeCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteServiceVariantElementFeeCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var success = await mediator.Send(command);
        return success ? Results.NoContent() : Results.NotFound();
    }
}
