using System;
using System.Collections.Generic;
using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.ServiceVariantElements.DTOs;
using EDGE.Application.ServiceVariantElements.Commands.CreateServiceVariantElement;
using EDGE.Application.ServiceVariantElements.Commands.UpdateServiceVariantElement;
using EDGE.Application.ServiceVariantElements.Commands.DeleteServiceVariantElement;
using EDGE.Application.ServiceVariantElements.Commands.SetServiceVariantElementFormula;
using EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElements;
using EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElementById;
using EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElementFormula;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public record SetServiceVariantElementFormulaRequest(
    Guid ServiceVariantId,
    Guid ElementId,
    string FormulaExpression,
    string? Description,
    bool ApplyLateRenewalSurcharge
);

public static class ServiceVariantElementEndpoints
{
    public static RouteGroupBuilder MapServiceVariantElementEndpoints(this RouteGroupBuilder group)
    {
        var elements = group.MapGroup("service-variant-elements")
            .WithTags("ServiceVariantElements");

        elements.MapGet("/formula", GetServiceVariantElementFormula)
            .WithName("GetServiceVariantElementFormula")
            .WithSummary("Get statutory formula for a service variant element")
            .WithDescription("Retrieves the statutory formula and surcharge settings for a specific element in a service variant.")
            .Produces<ApiResponse<ServiceVariantElementFormulaDto>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest);

        elements.MapPut("/formula", SetServiceVariantElementFormula)
            .WithName("SetServiceVariantElementFormula")
            .WithSummary("Set statutory formula for a service variant element")
            .WithDescription("Atomically creates or updates the statutory calculation formula for an element in a service variant.")
            .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<bool>>(StatusCodes.Status404NotFound);

        elements.MapGet("/", GetServiceVariantElements)
            .WithName("GetServiceVariantElements")
            .WithSummary("Get all elements for a service variant")
            .WithDescription("Retrieves all exam elements (code + description) belonging to a given ServiceVariant.")
            .Produces<PaginatedApiResponse<ServiceVariantElementDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        elements.MapGet("/{id:guid}", GetServiceVariantElementById)
            .WithName("GetServiceVariantElementById")
            .WithSummary("Get a service variant element by ID")
            .WithDescription("Retrieves a single ServiceVariantElement by its unique identifier.")
            .Produces<ServiceVariantElementDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        elements.MapPost("/", CreateServiceVariantElement)
            .WithName("CreateServiceVariantElement")
            .WithSummary("Create a service variant element")
            .WithDescription("Adds a new exam element (code + description) to an existing ServiceVariant.")
            .Produces<ServiceVariantElementDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        elements.MapPut("/{id:guid}", UpdateServiceVariantElement)
            .WithName("UpdateServiceVariantElement")
            .WithSummary("Update a service variant element")
            .WithDescription("Updates the code and description of an existing ServiceVariantElement.")
            .Produces<ServiceVariantElementDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        elements.MapDelete("/{id:guid}", DeleteServiceVariantElement)
            .WithName("DeleteServiceVariantElement")
            .WithSummary("Delete a service variant element")
            .WithDescription("Permanently removes a ServiceVariantElement by its unique identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    [HasPermission(Permissions.ReadServiceVariantElements)]
    public static async Task<IResult> GetServiceVariantElements(
        Guid? serviceId,
        Guid? serviceVariantId,
        int? pageNumber,
        int? pageSize,
        string? searchTerm,
        IValidator<GetServiceVariantElementsQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantElementsQuery(serviceId, serviceVariantId, pageNumber, pageSize, searchTerm);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadServiceVariantElements)]
    public static async Task<IResult> GetServiceVariantElementById(
        Guid id,
        IValidator<GetServiceVariantElementByIdQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantElementByIdQuery(id);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result is not null
            ? Results.Ok(result)
            : Results.NotFound(new { message = $"ServiceVariantElement with ID '{id}' was not found." });
    }

    [HasPermission(Permissions.CreateServiceVariantElements)]
    public static async Task<IResult> CreateServiceVariantElement(
        CreateServiceVariantElementCommand command,
        IValidator<CreateServiceVariantElementCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/service-variant-elements/{result.Id}", result);
    }

    [HasPermission(Permissions.UpdateServiceVariantElements)]
    public static async Task<IResult> UpdateServiceVariantElement(
        Guid id,
        UpdateServiceVariantElementCommand command,
        IValidator<UpdateServiceVariantElementCommand> validator,
        IMediator mediator)
    {
        if (command.Id == Guid.Empty)
        {
            command = command with { Id = id };
        }
        else if (id != command.Id)
        {
            return Results.BadRequest(new { message = "The path ID does not match the request body ID." });
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null
            ? Results.Ok(result)
            : Results.NotFound(new { message = $"ServiceVariantElement with ID '{id}' was not found." });
    }

    [HasPermission(Permissions.ReadServiceVariantElements)]
    public static async Task<IResult> GetServiceVariantElementFormula(
        Guid serviceVariantId,
        Guid elementId,
        IValidator<GetServiceVariantElementFormulaQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantElementFormulaQuery(serviceVariantId, elementId);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.UpdateServiceVariantElements)]
    public static async Task<IResult> SetServiceVariantElementFormula(
        SetServiceVariantElementFormulaRequest request,
        IValidator<SetServiceVariantElementFormulaCommand> validator,
        IMediator mediator)
    {
        var command = new SetServiceVariantElementFormulaCommand(
            request.ServiceVariantId,
            request.ElementId,
            request.FormulaExpression,
            request.Description,
            request.ApplyLateRenewalSurcharge
        );

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.DeleteServiceVariantElements)]
    public static async Task<IResult> DeleteServiceVariantElement(
        Guid id,
        IMediator mediator)
    {
        var success = await mediator.Send(new DeleteServiceVariantElementCommand(id));
        return success
            ? Results.NoContent()
            : Results.NotFound(new { message = $"ServiceVariantElement with ID '{id}' was not found." });
    }
}
