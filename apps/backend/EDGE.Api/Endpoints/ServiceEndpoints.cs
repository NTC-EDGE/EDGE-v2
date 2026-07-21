using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Services.Queries.GetServices;
using EDGE.Application.Services.Queries.GetServiceById;
using EDGE.Application.Forms.Queries.GetFormByServiceId;

namespace EDGE.Api.Endpoints;

public static class ServiceEndpoints
{
    public static void MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/services").WithTags("Services");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServicesQuery());
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServices")
        .WithSummary("Get list of services")
        .WithDescription("Retrieves all seeded catalog services with categories and variants.");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceById")
        .WithSummary("Get service details by ID")
        .WithDescription("Fetches a single service organizational catalog by ID.");

        group.MapGet("/{id:guid}/form", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetFormByServiceIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceFormLayout")
        .WithSummary("Get form builder layout for service")
        .WithDescription("Retrieves the dynamic form sections and fields layout mapping for a service.");
    }
}
