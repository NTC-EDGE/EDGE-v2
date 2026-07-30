using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Elements.Commands.CreateElement;
using EDGE.Application.Elements.Commands.UpdateElement;
using EDGE.Application.Elements.Commands.DeleteElement;
using EDGE.Application.Elements.Queries.GetElements;
using EDGE.Application.Elements.Queries.GetElementById;
using EDGE.Application.Elements.DTOs;

namespace EDGE.Api.Endpoints;

public record UpdateElementRequest(string Name, string Code, string? Description);

public static class ElementEndpoints
{
    public static RouteGroupBuilder MapElementEndpoints(this RouteGroupBuilder group)
    {
        var elements = group.MapGroup("elements")
            .WithTags("Elements");

        elements.MapGet("/", GetElements)
            .WithName("GetElements")
            .WithSummary("Get all elements")
            .WithDescription("Retrieves a list of all elements.")
            .Produces<List<ElementDto>>(StatusCodes.Status200OK);

        elements.MapGet("/{id:guid}", GetElementById)
            .WithName("GetElementById")
            .WithSummary("Get element by ID")
            .WithDescription("Retrieves details of a specific element by its ID.")
            .Produces<ElementDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        elements.MapPost("/", CreateElement)
            .WithName("CreateElement")
            .WithSummary("Create a new element")
            .WithDescription("Creates a new element record.")
            .Produces<ElementDto>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest);

        elements.MapPut("/{id:guid}", UpdateElement)
            .WithName("UpdateElement")
            .WithSummary("Update an existing element")
            .WithDescription("Updates an existing element record.")
            .Produces<ElementDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        elements.MapDelete("/{id:guid}", DeleteElement)
            .WithName("DeleteElement")
            .WithSummary("Delete an element")
            .WithDescription("Deletes an element record.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    public static async Task<IResult> GetElements(
        IValidator<GetElementsQuery> validator,
        IMediator mediator)
    {
        var query = new GetElementsQuery();
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return Results.Ok(result);
    }

    public static async Task<IResult> GetElementById(
        Guid id,
        IValidator<GetElementByIdQuery> validator,
        IMediator mediator)
    {
        var query = new GetElementByIdQuery(id);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    public static async Task<IResult> CreateElement(
        CreateElementCommand command,
        IValidator<CreateElementCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/elements/{result.Id}", result);
    }

    public static async Task<IResult> UpdateElement(
        Guid id,
        UpdateElementRequest request,
        IValidator<UpdateElementCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateElementCommand(id, request.Name, request.Code, request.Description);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    public static async Task<IResult> DeleteElement(
        Guid id,
        IValidator<DeleteElementCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteElementCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var success = await mediator.Send(command);
        return success ? Results.NoContent() : Results.NotFound();
    }
}
