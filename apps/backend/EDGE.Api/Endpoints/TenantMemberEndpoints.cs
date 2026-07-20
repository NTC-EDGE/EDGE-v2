using FluentValidation;
using MediatR;
using EDGE.Application.TenantMembers.Commands;
using EDGE.Application.TenantMembers.Queries;

namespace EDGE.Api.Endpoints;

public static class TenantMemberEndpoints
{
    public static RouteGroupBuilder MapTenantMemberEndpoints(this RouteGroupBuilder group)
    {
        var members = group.MapGroup("tenants/{tenantId:guid}/members")
            .WithTags("Tenant Members");

        members.MapPost("/", async (
            Guid tenantId,
            AssignUserToTenantCommand command,
            IValidator<AssignUserToTenantCommand> validator,
            IMediator mediator) =>
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
        })
        .WithName("AssignUserToTenant")
        .WithDescription("Assign a User to a Tenant and register their profile details")
        .RequireAuthorization();

        members.MapGet("/", async (Guid tenantId, IMediator mediator) =>
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
        })
        .WithName("GetTenantMembers")
        .WithDescription("Retrieve all members under a specific Tenant")
        .RequireAuthorization();

        members.MapGet("/{memberId:guid}", async (Guid tenantId, Guid memberId, IMediator mediator) =>
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
        })
        .WithName("GetMemberDetails")
        .WithDescription("Retrieve specific membership and profile details for a tenant member")
        .RequireAuthorization();

        members.MapPut("/{memberId:guid}", async (
            Guid tenantId,
            Guid memberId,
            UpdateMemberDetailsCommand command,
            IValidator<UpdateMemberDetailsCommand> validator,
            IMediator mediator) =>
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
        })
        .WithName("UpdateMemberDetails")
        .WithDescription("Update extended profile information or configuration for a tenant member")
        .RequireAuthorization();

        members.MapDelete("/{memberId:guid}", async (Guid tenantId, Guid memberId, IMediator mediator) =>
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
        })
        .WithName("RemoveUserFromTenant")
        .WithDescription("Remove a member from a Tenant")
        .RequireAuthorization();

        return group;
    }
}
