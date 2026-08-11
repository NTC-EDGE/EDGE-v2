using System.Collections.Generic;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Services.Dtos;
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
    public static IEndpointRouteBuilder MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var globalGroup = app.MapGroup("/services").WithTags("Services");
        var tenantGroup = app.MapGroup("/tenants/{tenantId:guid}/services").WithTags("Services");

        // --- Tenant-Scoped Endpoints (/tenants/{tenantId}/services) ---

        tenantGroup.MapGet("/", GetTenantServices)
            .WithName("GetTenantServices")
            .WithSummary("Get services for a specific tenant")
            .WithDescription("Retrieves catalog services scoped to tenant {tenantId}, with optional serviceCategoryId filter.")
            .Produces<PaginatedApiResponse<ServiceDto>>(StatusCodes.Status200OK);

        tenantGroup.MapPost("/", CreateTenantService)
            .WithName("CreateTenantService")
            .WithSummary("Create a new service under a tenant")
            .WithDescription("Creates a new catalog service associated with a category and tenant.");

        tenantGroup.MapPut("/{id:guid}", UpdateTenantService)
            .WithName("UpdateTenantService")
            .WithSummary("Update service details")
            .WithDescription("Updates catalog service information under a tenant.");

        tenantGroup.MapDelete("/{id:guid}", DeleteTenantService)
            .WithName("DeleteTenantService")
            .WithSummary("Delete a service under a tenant")
            .WithDescription("Deletes a service. Returns 409 Conflict if the service has associated applications.");

        // --- Global / Catalog Detail Endpoints (/services) ---

        globalGroup.MapGet("/", GetServices)
            .WithName("GetServices")
            .WithSummary("Get catalog services")
            .WithDescription("Retrieves all catalog services, with optional serviceCategoryId filter.")
            .Produces<PaginatedApiResponse<ServiceDto>>(StatusCodes.Status200OK);

        globalGroup.MapPost("/", CreateGlobalService)
            .WithName("CreateGlobalService")
            .WithSummary("Create a new global catalog service")
            .WithDescription("Creates a new catalog service with optional tenant binding.");

        globalGroup.MapPut("/{id:guid}", UpdateGlobalService)
            .WithName("UpdateGlobalService")
            .WithSummary("Update global service details")
            .WithDescription("Updates catalog service information.");

        globalGroup.MapDelete("/{id:guid}", DeleteGlobalService)
            .WithName("DeleteGlobalService")
            .WithSummary("Delete a global service")
            .WithDescription("Deletes a service. Returns 409 Conflict if the service has associated applications.");

        globalGroup.MapGet("/{id:guid}", GetServiceById)
            .WithName("GetServiceById")
            .WithSummary("Get service details by ID")
            .WithDescription("Fetches a single service by its unique identifier.")
            .Produces<ApiResponse<ServiceDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<ServiceDto>>(StatusCodes.Status404NotFound);

        globalGroup.MapGet("/{id:guid}/variants", GetServiceVariants)
            .WithName("GetServiceVariants")
            .WithSummary("Get service variants")
            .WithDescription("Fetches active variants for a service.");

        globalGroup.MapGet("/{id:guid}/contract", GetServiceContract)
            .WithName("GetServiceContract")
            .WithSummary("Get service contract schema")
            .WithDescription("Fetches the service contract schema.");

        globalGroup.MapGet("/{id:guid}/form", GetServiceFormLayout)
            .WithName("GetServiceFormLayout")
            .WithSummary("Get form builder layout for service")
            .WithDescription("Fetches dynamic sections, fields, and options configured in the form builder for a service.");

        return app;
    }

    [HasPermission(Permissions.CreateServices)]
    public static async Task<IResult> CreateGlobalService(CreateServiceCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? Results.Created($"/api/v2/services/{result.Data}", result)
            : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateServices)]
    public static async Task<IResult> UpdateGlobalService(Guid id, UpdateServiceCommand command, IMediator mediator)
    {
        var updatedCommand = command with { Id = id };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.DeleteServices)]
    public static async Task<IResult> DeleteGlobalService(Guid id, IMediator mediator)
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

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetTenantServices(
        Guid tenantId, 
        Guid? serviceCategoryId, 
        int? pageNumber, 
        int? pageSize, 
        string? searchTerm, 
        IMediator mediator)
    {
        var result = await mediator.Send(new GetServicesQuery(serviceCategoryId, tenantId, pageNumber, pageSize, searchTerm));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CreateServices)]
    public static async Task<IResult> CreateTenantService(Guid tenantId, CreateServiceCommand command, IMediator mediator)
    {
        var updatedCommand = command with { TenantId = tenantId };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded
            ? Results.Created($"/api/v2/tenants/{tenantId}/services/{result.Data}", result)
            : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateServices)]
    public static async Task<IResult> UpdateTenantService(Guid tenantId, Guid id, UpdateServiceCommand command, IMediator mediator)
    {
        var updatedCommand = command with { TenantId = tenantId, Id = id };
        var result = await mediator.Send(updatedCommand);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.DeleteServices)]
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

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServices(
        Guid? serviceCategoryId, 
        int? pageNumber, 
        int? pageSize, 
        string? searchTerm, 
        IMediator mediator)
    {
        var result = await mediator.Send(new GetServicesQuery(serviceCategoryId, null, pageNumber, pageSize, searchTerm));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceByIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceVariants(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceVariantsQuery(id, 1, 100));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceContract(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceContractQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceFormLayout(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetFormByServiceIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }
}
