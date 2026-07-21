using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Catalog.Services.Commands;
using EDGE.Application.Catalog.Services.Queries;

namespace EDGE.Api.Endpoints;

public static class ServiceEndpoints
{
    public static void MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/catalog/services").WithTags("Catalog — Services");

        group.MapGet("/", async (Guid? categoryId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServicesQuery(categoryId));
            return Results.Ok(result);
        })
        .WithName("GetServices")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetServiceById")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapPost("/", async (
            CreateServiceCommand command,
            IValidator<CreateServiceCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/catalog/services/{result.Id}", result);
        })
        .WithName("CreateService")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateServiceCommand command,
            IValidator<UpdateServiceCommand> validator,
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
        .WithName("UpdateService")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteServiceCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteService")
        .RequireAuthorization(Policies.AdminOnly);
    }
}
