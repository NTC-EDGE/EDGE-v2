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
        var globalGroup = app.MapGroup("/services").WithTags("Services");
        var tenantGroup = app.MapGroup("/tenants/{tenantId:guid}/services").WithTags("Services");

        // --- Tenant-Scoped Endpoints (/tenants/{tenantId}/services) ---

        // GET /tenants/{tenantId}/services?serviceCategoryId=
        tenantGroup.MapGet("/", async (Guid tenantId, Guid? serviceCategoryId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServicesQuery(serviceCategoryId, tenantId));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetTenantServices")
        .WithSummary("Get services for a specific tenant")
        .WithDescription("Retrieves catalog services scoped to tenant {tenantId}, with optional serviceCategoryId filter.");

        // POST /tenants/{tenantId}/services — Create service under tenant
        tenantGroup.MapPost("/", async (Guid tenantId, CreateServiceCommand command, IMediator mediator) =>
        {
            var updatedCommand = command with { TenantId = tenantId };
            var result = await mediator.Send(updatedCommand);
            return result.Succeeded
                ? Results.Created($"/api/v2/tenants/{tenantId}/services/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateTenantService")
        .WithSummary("Create a new service under a tenant")
        .WithDescription("Creates a new catalog service associated with a category and tenant.");

        // PUT /tenants/{tenantId}/services/{id} — Update service under tenant
        tenantGroup.MapPut("/{id:guid}", async (Guid tenantId, Guid id, UpdateServiceCommand command, IMediator mediator) =>
        {
            var updatedCommand = command with { TenantId = tenantId, Id = id };
            var result = await mediator.Send(updatedCommand);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateTenantService")
        .WithSummary("Update service details")
        .WithDescription("Updates catalog service information under a tenant.");

        // DELETE /tenants/{tenantId}/services/{id} — Delete service under tenant
        tenantGroup.MapDelete("/{id:guid}", async (Guid tenantId, Guid id, IMediator mediator) =>
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
        .WithName("DeleteTenantService")
        .WithSummary("Delete a service under a tenant")
        .WithDescription("Deletes a service. Returns 409 Conflict if the service has associated applications.");

        // --- Global / Catalog Detail Endpoints (/services) ---

        // GET /services?serviceCategoryId=
        globalGroup.MapGet("/", async (Guid? serviceCategoryId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServicesQuery(serviceCategoryId, null));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServices")
        .WithSummary("Get catalog services")
        .WithDescription("Retrieves all catalog services, with optional serviceCategoryId filter.");

        // GET /services/{id} — single service detail
        globalGroup.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceById")
        .WithSummary("Get service details by ID");

        // GET /services/{id}/variants
        globalGroup.MapGet("/{id:guid}/variants", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceVariantsQuery(id));
            return Results.Ok(result);
        })
        .WithName("GetServiceVariants")
        .WithSummary("Get service variants");

        // GET /services/{id}/contract
        globalGroup.MapGet("/{id:guid}/contract", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceContractQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceContract")
        .WithSummary("Get service contract schema");

        // GET /services/{id}/form
        globalGroup.MapGet("/{id:guid}/form", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetFormByServiceIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetServiceFormLayout")
        .WithSummary("Get form builder layout for service");
    }
}
