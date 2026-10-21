using System;
using System.Threading;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Common.Interfaces;
using System.Collections.Generic;
using FluentValidation;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Tenants.Commands;
using EDGE.Application.Tenants.Queries;
using EDGE.Application.TenantMembers.Queries;
using EDGE.Application.Common.Models;
using EDGE.Application.Auth.Commands.VerifyStaffSession;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Tenants.DTOs;
using EDGE.Application.TenantMembers.DTOs;
using EDGE.Application.Tenants.Queries.GetTenantClients;
using EDGE.Application.Tenants.Queries.GetTenantClientDetails;
using EDGE.Application.Tenants.Queries.GetTenantTransactions;

namespace EDGE.Api.Endpoints;

public static class TenantEndpoints
{
    public static RouteGroupBuilder MapTenantEndpoints(this RouteGroupBuilder group)
    {
        var tenants = group.MapGroup("tenants")
            .WithTags("Tenants");

        tenants.MapPost("/", CreateTenant)
            .WithName("CreateTenant")
            .WithTags("Tenants")
            .WithSummary("Create new tenant organization")
            .WithDescription("Creates a new Tenant organization, company, or regional branch.")
            .Produces<TenantDto>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);

        tenants.MapGet("/", GetAllTenants)
            .WithName("GetAllTenants")
            .WithTags("Tenants")
            .WithSummary("Retrieve all tenants")
            .WithDescription("Retrieves paginated Tenant organizations registered across regions.")
            .Produces<PaginatedApiResponse<TenantDto>>(StatusCodes.Status200OK);

        tenants.MapGet("/my-memberships", GetMyTenantMemberships)
            .WithName("GetMyTenantMemberships")
            .WithTags("Tenants")
            .WithSummary("Retrieve caller's active regional office memberships")
            .WithDescription("Fetches all active Regional Office tenants and regions that the authenticated caller is a member of.")
            .Produces<ApiResponse<List<TenantRegionMembershipDto>>>(StatusCodes.Status200OK);

        tenants.MapGet("/{id:guid}", GetTenantById)
            .WithName("GetTenantById")
            .WithTags("Tenants")
            .WithSummary("Retrieve tenant by ID")
            .WithDescription("Retrieves detailed profile information for a specific Tenant by its unique identifier.")
            .Produces<TenantDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        tenants.MapPut("/{id:guid}", UpdateTenant)
            .WithName("UpdateTenant")
            .WithTags("Tenants")
            .WithSummary("Update tenant details")
            .WithDescription("Updates an existing Tenant's name, code, description, or active status.")
            .Produces<TenantDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);

        tenants.MapDelete("/{id:guid}", DeleteTenant)
            .WithName("DeleteTenant")
            .WithTags("Tenants")
            .WithSummary("Delete tenant organization")
            .WithDescription("Deletes a Tenant organization by its unique ID.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        tenants.MapPost("/{id:guid}/toggle-active", ToggleTenantActive)
            .WithName("ToggleTenantActive")
            .WithTags("Tenants")
            .WithSummary("Toggle tenant active status")
            .WithDescription("Toggles the IsActive status (active/deactivate) of a tenant organization.")
            .Produces<TenantDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        tenants.MapGet("/{id:guid}/clients", GetTenantClients)
            .WithName("GetTenantClients")
            .WithTags("Tenants")
            .WithSummary("Retrieve tenant client profiles (paginated)")
            .WithDescription("Retrieves paginated client and applicant entities who have submitted applications or transactions in this tenant office.")
            .Produces<PaginatedApiResponse<TenantClientDto>>(StatusCodes.Status200OK);

        tenants.MapGet("/{id:guid}/clients/{clientId:guid}", GetTenantClientDetails)
            .WithName("GetTenantClientDetails")
            .WithTags("Tenants")
            .WithSummary("Retrieve detailed client/applicant record for a tenant")
            .WithDescription("Retrieves biographical, corporate, service, and transaction breakdown for a client of this tenant.")
            .Produces<TenantClientDetailsDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        tenants.MapGet("/{id:guid}/transactions", GetTenantTransactions)
            .WithName("GetTenantTransactions")
            .WithTags("Tenants")
            .WithSummary("Retrieve tenant regulatory and fee transactions (paginated)")
            .WithDescription("Retrieves paginated financial, permit, and fee transactions recorded for this tenant office.")
            .Produces<PaginatedApiResponse<TenantTransactionDto>>(StatusCodes.Status200OK);

        tenants.MapPost("/verify-membership", VerifyTenantMembership)
            .WithName("VerifyTenantMembership")
            .WithTags("Tenants")
            .WithSummary("Verify staff tenant and region membership")
            .WithDescription("Validates that an authenticated staff member belongs to the selected Regional Office tenant.")
            .Produces<ApiResponse<VerifyStaffSessionDto>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<VerifyStaffSessionDto>>(StatusCodes.Status403Forbidden);

        tenants.MapGet("/{id:guid}/config", GetTenantConfig)
            .WithName("GetTenantConfigById")
            .WithTags("Tenants")
            .WithSummary("Retrieve tenant regional configuration")
            .WithDescription("Retrieves RCCodeSOA, RCCodeOP, FundCluster, and RequestAndComplaintRouting for a specific tenant.")
            .Produces<ApiResponse<RegionalConfigurationDto>>(StatusCodes.Status200OK);

        tenants.MapPut("/{id:guid}/config", UpdateTenantConfig)
            .WithName("UpdateTenantConfigById")
            .WithTags("Tenants")
            .WithSummary("Update tenant regional configuration")
            .WithDescription("Updates RCCodeSOA, RCCodeOP, FundCluster, and RequestAndComplaintRouting for a specific tenant.")
            .Produces<ApiResponse<RegionalConfigurationDto>>(StatusCodes.Status200OK);

        tenants.MapGet("/config", GetCurrentTenantConfig)
            .WithName("GetCurrentTenantConfig")
            .WithTags("Tenants")
            .WithSummary("Retrieve current tenant regional configuration")
            .WithDescription("Retrieves RCCodeSOA, RCCodeOP, FundCluster, and RequestAndComplaintRouting for the current or default tenant.")
            .Produces<ApiResponse<RegionalConfigurationDto>>(StatusCodes.Status200OK);

        tenants.MapPut("/config", UpdateCurrentTenantConfig)
            .WithName("UpdateCurrentTenantConfig")
            .WithTags("Tenants")
            .WithSummary("Update current tenant regional configuration")
            .WithDescription("Updates RCCodeSOA, RCCodeOP, FundCluster, and RequestAndComplaintRouting.")
            .Produces<ApiResponse<RegionalConfigurationDto>>(StatusCodes.Status200OK);

        return group;
    }

    public static async Task<IResult> GetMyTenantMemberships(IMediator mediator)
    {
        var result = await mediator.Send(new GetMyTenantMembershipsQuery());
        return Results.Ok(result);
    }

    public static async Task<IResult> VerifyTenantMembership(
        VerifyStaffSessionCommand command,
        IValidator<VerifyStaffSessionCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded)
        {
            return Results.Json(result, statusCode: StatusCodes.Status403Forbidden);
        }

        return Results.Ok(result);
    }

    [HasPermission(Permissions.CreateTenants)]
    public static async Task<IResult> CreateTenant(
        CreateTenantCommand command,
        IValidator<CreateTenantCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        try
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/tenants/{result.Id}", result);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetAllTenants(
        IMediator mediator,
        [Microsoft.AspNetCore.Mvc.FromQuery] int pageNumber = 1,
        [Microsoft.AspNetCore.Mvc.FromQuery] int pageSize = 10,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? searchTerm = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] bool? isActive = null)
    {
        var result = await mediator.Send(new GetAllTenantsQuery(pageNumber, pageSize, searchTerm, isActive));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetTenantById(Guid id, IMediator mediator)
    {
        try
        {
            var result = await mediator.Send(new GetTenantByIdQuery(id));
            return Results.Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return Results.NotFound(new { message = $"Tenant with ID '{id}' was not found." });
        }
    }

    [HasPermission(Permissions.UpdateTenants)]
    public static async Task<IResult> UpdateTenant(
        Guid id,
        UpdateTenantCommand command,
        IValidator<UpdateTenantCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(new { message = "The path ID does not match the request body ID." });
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        try
        {
            var result = await mediator.Send(command);
            return Results.Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return Results.NotFound(new { message = $"Tenant with ID '{id}' was not found." });
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.DeleteTenants)]
    public static async Task<IResult> DeleteTenant(Guid id, IMediator mediator)
    {
        try
        {
            await mediator.Send(new DeleteTenantCommand(id));
            return Results.NoContent();
        }
        catch (KeyNotFoundException)
        {
            return Results.NotFound(new { message = $"Tenant with ID '{id}' was not found." });
        }
    }

    [HasPermission(Permissions.UpdateTenants)]
    public static async Task<IResult> ToggleTenantActive(Guid id, IMediator mediator)
    {
        try
        {
            var result = await mediator.Send(new ToggleTenantActiveCommand(id));
            return Results.Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return Results.NotFound(new { message = $"Tenant with ID '{id}' was not found." });
        }
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetTenantClients(
        Guid id,
        IMediator mediator,
        int pageNumber = 1,
        int pageSize = 10,
        string? searchTerm = null,
        string? search = null)
    {
        var term = !string.IsNullOrWhiteSpace(searchTerm) ? searchTerm : search;
        var result = await mediator.Send(new GetTenantClientsQuery(id, term, pageNumber, pageSize));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetTenantClientDetails(
        Guid id,
        Guid clientId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetTenantClientDetailsQuery(id, clientId));
        if (result == null)
        {
            return Results.NotFound(new { message = $"Client record with ID '{clientId}' not found in this tenant." });
        }
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetTenantConfig(
        Guid id,
        IRegionalConfigurationService configService,
        CancellationToken cancellationToken)
    {
        var result = await configService.GetConfigurationAsync(id, cancellationToken);
        return Results.Ok(ApiResponse<RegionalConfigurationDto>.Success(result));
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateTenantConfig(
        Guid id,
        RegionalConfigurationDto command,
        IRegionalConfigurationService configService,
        CancellationToken cancellationToken)
    {
        command.TenantId = id;
        var result = await configService.UpdateConfigurationAsync(command, cancellationToken);
        return Results.Ok(ApiResponse<RegionalConfigurationDto>.Success(result));
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetCurrentTenantConfig(
        [FromQuery] Guid? tenantId,
        IRegionalConfigurationService configService,
        ITenantContextService tenantContext,
        CancellationToken cancellationToken)
    {
        var targetTenantId = tenantId.HasValue && tenantId.Value != Guid.Empty
            ? tenantId.Value
            : (tenantContext.TenantId ?? Guid.Empty);
        var result = await configService.GetConfigurationAsync(targetTenantId, cancellationToken);
        return Results.Ok(ApiResponse<RegionalConfigurationDto>.Success(result));
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateCurrentTenantConfig(
        RegionalConfigurationDto command,
        IRegionalConfigurationService configService,
        ITenantContextService tenantContext,
        CancellationToken cancellationToken)
    {
        if (command.TenantId == Guid.Empty)
        {
            command.TenantId = tenantContext.TenantId ?? Guid.Empty;
        }
        var result = await configService.UpdateConfigurationAsync(command, cancellationToken);
        return Results.Ok(ApiResponse<RegionalConfigurationDto>.Success(result));
    }

    public static async Task<IResult> GetTenantTransactions(
        Guid id,
        IMediator mediator,
        int pageNumber = 1,
        int pageSize = 10,
        string? searchTerm = null,
        string? search = null)
    {
        var term = !string.IsNullOrWhiteSpace(searchTerm) ? searchTerm : search;
        var result = await mediator.Send(new GetTenantTransactionsQuery(id, term, pageNumber, pageSize));
        return Results.Ok(result);
    }
}
