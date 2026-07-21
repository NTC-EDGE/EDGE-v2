using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Catalog.ServiceCategories.Commands;
using EDGE.Application.Catalog.ServiceCategories.Queries;

namespace EDGE.Api.Endpoints;

public static class ServiceCategoryEndpoints
{
    public static void MapServiceCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/catalog/categories").WithTags("Catalog — Categories");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceCategoriesQuery());
            return Results.Ok(result);
        })
        .WithName("GetServiceCategories")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceCategoryByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetServiceCategoryById")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapPost("/", async (
            CreateServiceCategoryCommand command,
            IValidator<CreateServiceCategoryCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/catalog/categories/{result.Id}", result);
        })
        .WithName("CreateServiceCategory")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateServiceCategoryCommand command,
            IValidator<UpdateServiceCategoryCommand> validator,
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
            return Results.Ok(result);
        })
        .WithName("UpdateServiceCategory")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteServiceCategoryCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteServiceCategory")
        .RequireAuthorization(Policies.AdminOnly);
    }
}
