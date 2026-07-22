using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Services.Queries.GetServices;
using EDGE.Application.Services.Queries.GetServiceById;
using EDGE.Application.Services.Queries.GetServiceVariants;
using EDGE.Application.Services.Queries.GetServiceContract;
using EDGE.Application.Forms.Queries.GetFormByServiceId;

namespace EDGE.Api.Endpoints;

public static class ServiceEndpoints
{
    public static void MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/services").WithTags("Services");

        // 3.1 — GET /services?serviceCategoryId=&tenantId=
        // Contract JSON is NOT returned here — use GET /services/:id/contract.
        group.MapGet("/", async (Guid? serviceCategoryId, Guid? tenantId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServicesQuery(serviceCategoryId, tenantId));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServices")
        .WithSummary("Get list of services")
        .WithDescription("Retrieves catalog services, optionally filtered by ServiceCategoryId and/or TenantId. Contract JSON is excluded — see GET /services/:id/contract.");

        // GET /services/:id — single service detail (no contract, no variants)
        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceById")
        .WithSummary("Get service details by ID")
        .WithDescription("Fetches a single service. Contract and Variants are served by their own endpoints.");

        // 3.2 — GET /services/:id/variants
        // Always returns 200 with a list (empty when service has no variants).
        group.MapGet("/{id:guid}/variants", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceVariantsQuery(id));
            return Results.Ok(result);
        })
        .WithName("GetServiceVariants")
        .WithSummary("Get service variants")
        .WithDescription("Returns the list of variants for a service. Returns an empty list (not 404) when the service has no variants.");

        // 3.3 — GET /services/:id/contract
        group.MapGet("/{id:guid}/contract", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceContractQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceContract")
        .WithSummary("Get service contract schema")
        .WithDescription("Returns the full service contract object (section 5.1 shape). Use this to drive required-section enforcement on the frontend.");

        // 3.4 — GET /services/:id/form
        // Runs ContractFormValidator internally — returns 400 if seeding is broken.
        group.MapGet("/{id:guid}/form", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetFormByServiceIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServiceFormLayout")
        .WithSummary("Get form builder layout for service")
        .WithDescription("Retrieves the dynamic form sections and fields. Validates contract↔form alignment; returns 400 with error details if required sections are missing. Each field includes its FieldId GUID for use as submission payload keys.");
    }
}
