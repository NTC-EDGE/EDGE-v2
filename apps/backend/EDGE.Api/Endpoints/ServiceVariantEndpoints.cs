using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Catalog.ServiceVariants.Commands;
using EDGE.Application.Catalog.ServiceVariants.Queries;

namespace EDGE.Api.Endpoints;

public static class ServiceVariantEndpoints
{
    public static void MapServiceVariantEndpoints(this IEndpointRouteBuilder app)
    {
        // Variants are nested under their parent service
        var group = app.MapGroup("/catalog/services/{serviceId:guid}/variants").WithTags("Catalog — Variants");

        group.MapGet("/", async (Guid serviceId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceVariantsQuery(serviceId));
            return Results.Ok(result);
        })
        .WithName("GetServiceVariants")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapPost("/", async (
            Guid serviceId,
            CreateServiceVariantCommand command,
            IValidator<CreateServiceVariantCommand> validator,
            IMediator mediator) =>
        {
            if (serviceId != command.ServiceId)
            {
                return Results.BadRequest("Route serviceId does not match request body ServiceId.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/catalog/services/{serviceId}/variants/{result.Id}", result);
        })
        .WithName("CreateServiceVariant")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapPut("/{id:guid}", async (
            Guid serviceId,
            Guid id,
            UpdateServiceVariantCommand command,
            IValidator<UpdateServiceVariantCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id || serviceId != command.ServiceId)
            {
                return Results.BadRequest("Route IDs do not match request body IDs.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Ok(result);
        })
        .WithName("UpdateServiceVariant")
        .RequireAuthorization(Policies.AdminOnly);

        group.MapDelete("/{id:guid}", async (Guid serviceId, Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteServiceVariantCommand(id, serviceId));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteServiceVariant")
        .RequireAuthorization(Policies.AdminOnly);
    }
}
