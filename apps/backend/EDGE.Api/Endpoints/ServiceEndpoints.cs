using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
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
    public static RouteGroupBuilder MapServiceEndpoints(this RouteGroupBuilder group)
    {
        var globalServices = group.MapGroup("services")
            .WithTags("Services");

        var tenantServices = group.MapGroup("tenants/{tenantId:guid}/services")
            .WithTags("Services");

        // --- Tenant-Scoped Endpoints (/tenants/{tenantId}/services) ---

        tenantServices.MapGet("/", GetTenantServices)
            .WithName("GetTenantServices")
            .WithSummary("Get services for a specific tenant")
            .WithDescription("Retrieves catalog services scoped to tenant {tenantId}, with optional serviceCategoryId filter.");

        tenantServices.MapPost("/", CreateTenantService)
            .WithName("CreateTenantService")
            .WithSummary("Create a new service under a tenant")
            .WithDescription("Creates a new catalog service associated with a category and tenant.");

        tenantServices.MapPut("/{id:guid}", UpdateTenantService)
            .WithName("UpdateTenantService")
            .WithSummary("Update service details")
            .WithDescription("Updates catalog service information under a tenant.");

        tenantServices.MapDelete("/{id:guid}", DeleteTenantService)
            .WithName("DeleteTenantService")
            .WithSummary("Delete a service under a tenant")
            .WithDescription("Deletes a service. Returns 409 Conflict if the service has associated applications.");

        // --- Global / Catalog Detail Endpoints (/services) ---

        globalServices.MapGet("/", GetServices)
            .WithName("GetServices")
            .WithSummary("Get catalog services")
            .WithDescription("Retrieves all catalog services, with optional serviceCategoryId filter.");

        globalServices.MapGet("/{id:guid}", GetServiceById)
            .WithName("GetServiceById")
            .WithSummary("Get service details by ID")
            .WithDescription("Fetches a single service by its unique identifier.");

        globalServices.MapGet("/{id:guid}/variants", GetServiceVariants)
            .WithName("GetServiceVariants")
            .WithSummary("Get service variants")
            .WithDescription("Fetches active variants for a service.");

        globalServices.MapGet("/{id:guid}/contract", GetServiceContract)
            .WithName("GetServiceContract")
            .WithSummary("Get service contract schema")
            .WithDescription("Fetches the service contract schema.");

        globalServices.MapGet("/{id:guid}/form", GetServiceFormLayout)
            .WithName("GetServiceFormLayout")
            .WithSummary("Get form builder layout for service")
            .WithDescription("Fetches dynamic sections, fields, and options configured in the form builder for a service.");

        return group;
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetTenantServices(Guid tenantId, Guid? serviceCategoryId, IMediator mediator)
    {
        var result = await mediator.Send(new GetServicesQuery(serviceCategoryId, tenantId));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> CreateTenantService(Guid tenantId, CreateServiceCommand command, IMediator mediator)
    {
        var updatedCommand = command with { TenantId = tenantId };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded
            ? Results.Created($"/api/v2/tenants/{tenantId}/services/{result.Data}", result)
            : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateTenantService(Guid tenantId, Guid id, UpdateServiceCommand command, IMediator mediator)
    {
        var updatedCommand = command with { TenantId = tenantId, Id = id };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> DeleteTenantService(Guid tenantId, Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new DeleteServiceCommand(id));
        if (!result.Succeeded)
        {
            return result.Message != null && result.Message.Contains("not found")
                ? Results.NotFound(result)
                : Results.Conflict(result);
        }
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetServices(Guid? serviceCategoryId, IMediator mediator)
    {
        var result = await mediator.Send(new GetServicesQuery(serviceCategoryId, null));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetServiceById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceByIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetServiceVariants(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceVariantsQuery(id));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetServiceContract(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceContractQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetServiceFormLayout(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetFormByServiceIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }
}
