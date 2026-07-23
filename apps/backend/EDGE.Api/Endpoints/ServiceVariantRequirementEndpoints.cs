using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.ServiceVariantRequirements.Commands.CreateServiceVariantRequirement;
using EDGE.Application.ServiceVariantRequirements.Commands.UpdateServiceVariantRequirement;
using EDGE.Application.ServiceVariantRequirements.Commands.DeleteServiceVariantRequirement;
using EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirementById;
using EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirements;

namespace EDGE.Api.Endpoints;

public static class ServiceVariantRequirementEndpoints
{
    public static RouteGroupBuilder MapServiceVariantRequirementEndpoints(this RouteGroupBuilder group)
    {
        var svr = group.MapGroup("service-variant-requirements")
            .WithTags("ServiceVariantRequirements");

        svr.MapPost("/", async (CreateServiceVariantRequirementCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/service-variant-requirements", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateServiceVariantRequirement")
        .WithSummary("Create new service variant requirements in bulk")
        .WithDescription("Creates new mappings of requirements to a service variant in bulk.");

        svr.MapPut("/{id:guid}", async (Guid id, UpdateServiceVariantRequirementCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(new { message = "The path ID does not match the request body ID." });
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("UpdateServiceVariantRequirement")
        .WithSummary("Update an existing service variant requirement")
        .WithDescription("Updates the details of a service variant requirement mapping.");

        svr.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteServiceVariantRequirementCommand(id));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("DeleteServiceVariantRequirement")
        .WithSummary("Delete a service variant requirement")
        .WithDescription("Deletes a specific service variant requirement mapping.");

        svr.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceVariantRequirementByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceVariantRequirementById")
        .WithSummary("Get a service variant requirement by ID")
        .WithDescription("Retrieves the details of a specific service variant requirement.");

        svr.MapGet("/", async (Guid serviceVariantId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceVariantRequirementsQuery(serviceVariantId));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServiceVariantRequirements")
        .WithSummary("Get all requirements for a service variant")
        .WithDescription("Retrieves all requirement mappings for a specific service variant.");

        return group;
    }
}
