using System;
using System.Collections.Generic;
using FluentValidation;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.TenantMembers.Commands;
using EDGE.Application.TenantMembers.Queries;
using EDGE.Application.TenantMembers.DTOs;
using EDGE.Api.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace EDGE.Api.Endpoints;

public static class TenantMemberEndpoints
{
    public static RouteGroupBuilder MapTenantMemberEndpoints(this RouteGroupBuilder group)
    {
        var members = group.MapGroup("tenants/{tenantId:guid}/members")
            .WithTags("Tenant Members")
            .RequireTenantMembership();

        members.MapPost("/", AssignUserToTenant)
            .WithName("AssignUserToTenant")
            .WithTags("Tenant Members")
            .WithSummary("Assign user to tenant")
            .WithDescription("Assigns a user to a tenant organization and registers member details including role, division, position, level, and field office.")
            .Produces<TenantMemberDto>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);

        members.MapGet("/", GetTenantMembers)
            .WithName("GetTenantMembers")
            .WithTags("Tenant Members")
            .WithSummary("Retrieve tenant members")
            .WithDescription("Retrieves all assigned members under a specific tenant organization.")
            .Produces<List<TenantMemberDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        members.MapGet("/{memberId:guid}", GetMemberDetails)
            .WithName("GetMemberDetails")
            .WithTags("Tenant Members")
            .WithSummary("Get tenant member details")
            .WithDescription("Retrieves specific membership and profile details for a tenant member.")
            .Produces<TenantMemberDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        members.MapPut("/{memberId:guid}", UpdateMemberDetails)
            .WithName("UpdateMemberDetails")
            .WithTags("Tenant Members")
            .WithSummary("Update tenant member details")
            .WithDescription("Updates extended profile information, role, field office, division, or position for a tenant member.")
            .Produces<TenantMemberDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        members.MapDelete("/{memberId:guid}", RemoveUserFromTenant)
            .WithName("RemoveUserFromTenant")
            .WithTags("Tenant Members")
            .WithSummary("Remove user from tenant")
            .WithDescription("Removes a member's assignment from a tenant organization.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        return group;
    }

    [HasPermission(Permissions.ManageTenantMembers)]
    public static async Task<IResult> AssignUserToTenant(
        Guid tenantId,
        AssignUserToTenantCommand command,
        IValidator<AssignUserToTenantCommand> validator,
        IMediator mediator)
    {
        if (tenantId != command.TenantId)
        {
            return Results.BadRequest(new { message = "The route TenantID does not match the request body TenantID." });
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        try
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/tenants/{tenantId}/members/{result.Id}", result);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.ManageTenantMembers)]
    public static async Task<IResult> GetTenantMembers(Guid tenantId, IMediator mediator)
    {
        try
        {
            var result = await mediator.Send(new GetMembersByTenantQuery(tenantId));
            return Results.Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.ManageTenantMembers)]
    public static async Task<IResult> GetMemberDetails(Guid tenantId, Guid memberId, IMediator mediator)
    {
        try
        {
            var result = await mediator.Send(new GetMemberDetailsQuery(memberId, tenantId));
            return Results.Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.ManageTenantMembers)]
    public static async Task<IResult> UpdateMemberDetails(
        Guid tenantId,
        Guid memberId,
        UpdateMemberDetailsCommand command,
        IValidator<UpdateMemberDetailsCommand> validator,
        IMediator mediator)
    {
        if (tenantId != command.TenantId || memberId != command.MemberId)
        {
            return Results.BadRequest(new { message = "Route parameters do not match request body parameters." });
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
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.ManageTenantMembers)]
    public static async Task<IResult> RemoveUserFromTenant(Guid tenantId, Guid memberId, IMediator mediator)
    {
        try
        {
            await mediator.Send(new RemoveUserFromTenantCommand(memberId, tenantId));
            return Results.NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(new { message = ex.Message });
        }
    }
}
