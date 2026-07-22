using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Services.Queries.GetServices;
using EDGE.Application.Services.Queries.GetServiceById;
using EDGE.Application.Services.Queries.GetServiceVariants;
using EDGE.Application.Services.Queries.GetServiceContract;
using EDGE.Application.Services.Commands.CreateService;
using EDGE.Application.Services.Commands.UpdateService;
using EDGE.Application.Services.Commands.DeleteService;
using EDGE.Application.Forms.Queries.GetFormByServiceId;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class ServiceEndpoints
{
    public static void MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/services").WithTags("Services");

        // 3.1 — GET /services?serviceCategoryId=&tenantId=
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
        group.MapGet("/{id:guid}/form", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetFormByServiceIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServiceFormLayout")
        .WithSummary("Get form builder layout for service")
        .WithDescription("Retrieves the dynamic form sections and fields. Validates contract↔form alignment; returns 400 with error details if required sections are missing. Each field includes its FieldId GUID for use as submission payload keys.");

        // POST /services — Create new Service
        group.MapPost("/", async (CreateServiceCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/services/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateService")
        .WithSummary("Create a new service")
        .WithDescription("Creates a new catalog service associated with a category and tenant.");

        // PUT /services/:id — Update Service
        group.MapPut("/{id:guid}", async (Guid id, UpdateServiceCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(ApiResponse<string>.Fail("ID path parameter does not match command body ID."));
            }

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateService")
        .WithSummary("Update service details")
        .WithDescription("Updates catalog service information including category, tenant, name, code, group, description, and contract JSON.");

        // DELETE /services/:id — Delete Service
        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteServiceCommand(id));
            if (!result.Succeeded)
            {
                return result.Message != null && result.Message.Contains("not found")
                    ? Results.NotFound(result)
                    : Results.Conflict(result);
            }
            return Results.Ok(result);
        })
        .WithName("DeleteService")
        .WithSummary("Delete a service")
        .WithDescription("Deletes a service. Returns 409 Conflict if the service has associated applications.");
    }
}
