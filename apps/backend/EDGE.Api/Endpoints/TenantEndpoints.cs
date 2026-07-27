using System;
using System.Collections.Generic;
using FluentValidation;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Tenants.Commands;
using EDGE.Application.Tenants.Queries;
using EDGE.Application.TenantMembers.Queries;
using EDGE.Application.Auth.Commands.VerifyStaffSession;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

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
            .WithDescription("Creates a new Tenant organization, company, or regional branch.");

        tenants.MapGet("/", GetAllTenants)
            .WithName("GetAllTenants")
            .WithTags("Tenants")
            .WithSummary("Retrieve all tenants")
            .WithDescription("Retrieves all Tenant organizations registered across regions.");

        tenants.MapGet("/my-memberships", GetMyTenantMemberships)
            .WithName("GetMyTenantMemberships")
            .WithTags("Tenants")
            .WithSummary("Retrieve caller's active regional office memberships")
            .WithDescription("Fetches all active Regional Office tenants and regions that the authenticated caller is a member of.");

        tenants.MapGet("/{id:guid}", GetTenantById)
            .WithName("GetTenantById")
            .WithTags("Tenants")
            .WithSummary("Retrieve tenant by ID")
            .WithDescription("Retrieves detailed profile information for a specific Tenant by its unique identifier.");

        tenants.MapPut("/{id:guid}", UpdateTenant)
            .WithName("UpdateTenant")
            .WithTags("Tenants")
            .WithSummary("Update tenant details")
            .WithDescription("Updates an existing Tenant's name, code, description, or active status.");

        tenants.MapDelete("/{id:guid}", DeleteTenant)
            .WithName("DeleteTenant")
            .WithTags("Tenants")
            .WithSummary("Delete tenant organization")
            .WithDescription("Deletes a Tenant organization by its unique ID.");

        tenants.MapPost("/verify-membership", VerifyTenantMembership)
            .WithName("VerifyTenantMembership")
            .WithTags("Tenants")
            .WithSummary("Verify staff tenant and region membership")
            .WithDescription("Validates that an authenticated staff member belongs to the selected Regional Office tenant.");

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
    public static async Task<IResult> GetAllTenants(IMediator mediator)
    {
        var result = await mediator.Send(new GetAllTenantsQuery());
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
}
