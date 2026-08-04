using MediatR;
using FluentValidation;
using EDGE.Application.ServiceVariantElements.Commands.CreateServiceVariantElement;
using EDGE.Application.ServiceVariantElements.Commands.UpdateServiceVariantElement;
using EDGE.Application.ServiceVariantElements.Commands.DeleteServiceVariantElement;
using EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElements;
using EDGE.Application.ServiceVariantElements.Queries.GetServiceVariantElementById;

namespace EDGE.Api.Endpoints;

public static class ServiceVariantElementEndpoints
{
    public static void MapServiceVariantElementEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/service-variant-elements").WithTags("ServiceVariantElements");

        // GET /service-variant-elements?serviceVariantId={id}
        group.MapGet("/", async (
            Guid serviceVariantId,
            IValidator<GetServiceVariantElementsQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetServiceVariantElementsQuery(serviceVariantId);
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetServiceVariantElements")
        .WithSummary("Get all elements for a service variant")
        .WithDescription("Retrieves all exam elements (code + description) belonging to a given ServiceVariant.");

        // GET /service-variant-elements/{id}
        group.MapGet("/{id:guid}", async (
            Guid id,
            IValidator<GetServiceVariantElementByIdQuery> validator,
            IMediator mediator) =>
        {
            var query = new GetServiceVariantElementByIdQuery(id);
            var validationResult = await validator.ValidateAsync(query);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(query);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetServiceVariantElementById")
        .WithSummary("Get a service variant element by ID")
        .WithDescription("Retrieves a single ServiceVariantElement by its unique identifier.");

        // POST /service-variant-elements
        group.MapPost("/", async (
            CreateServiceVariantElementCommand command,
            IValidator<CreateServiceVariantElementCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/service-variant-elements/{result.Id}", result);
        })
        .WithName("CreateServiceVariantElement")
        .WithSummary("Create a service variant element")
        .WithDescription("Adds a new exam element (code + description) to an existing ServiceVariant.");

        // PUT /service-variant-elements/{id}
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateServiceVariantElementCommand command,
            IValidator<UpdateServiceVariantElementCommand> validator,
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
        .WithName("UpdateServiceVariantElement")
        .WithSummary("Update a service variant element")
        .WithDescription("Updates the code and description of an existing ServiceVariantElement.");

        // DELETE /service-variant-elements/{id}
        group.MapDelete("/{id:guid}", async (
            Guid id,
            IValidator<DeleteServiceVariantElementCommand> validator,
            IMediator mediator) =>
        {
            var command = new DeleteServiceVariantElementCommand(id);
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteServiceVariantElement")
        .WithSummary("Delete a service variant element")
        .WithDescription("Permanently removes a ServiceVariantElement by its unique identifier.");
    }
}
