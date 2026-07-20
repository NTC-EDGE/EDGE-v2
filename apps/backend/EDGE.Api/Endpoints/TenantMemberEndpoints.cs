using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.TenantMembers.Commands;
using EDGE.Application.TenantMembers.Queries;

namespace EDGE.Api.Endpoints;

public static class TenantMemberEndpoints
{
    public static void MapTenantMemberEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/tenants/{tenantId:guid}/members").WithTags("Tenant Members");

        group.MapGet("/", async (Guid tenantId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTenantMembersQuery(tenantId));
            return Results.Ok(result);
        })
        .WithName("GetTenantMembers")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPost("/", async (
            Guid tenantId,
            AddTenantMemberCommand command,
            IValidator<AddTenantMemberCommand> validator,
            IMediator mediator) =>
        {
            if (tenantId != command.TenantId)
            {
                return Results.BadRequest("Route tenant ID does not match request body tenant ID.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/tenants/{tenantId}/members/{result.UserId}", result);
        })
        .WithName("AddTenantMember")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPut("/{userId:guid}", async (
            Guid tenantId,
            Guid userId,
            UpdateTenantMemberCommand command,
            IValidator<UpdateTenantMemberCommand> validator,
            IMediator mediator) =>
        {
            if (tenantId != command.TenantId || userId != command.UserId)
            {
                return Results.BadRequest("Route parameters do not match request body.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("UpdateTenantMember")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapDelete("/{userId:guid}", async (
            Guid tenantId,
            Guid userId,
            IMediator mediator) =>
        {
            var success = await mediator.Send(new RemoveTenantMemberCommand(tenantId, userId));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("RemoveTenantMember")
        .RequireAuthorization(Policies.CanManageUsers);

        app.MapGet("/users/{userId:guid}/tenants", async (Guid userId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUserTenantsQuery(userId));
            return Results.Ok(result);
        })
        .WithTags("Tenant Members")
        .WithName("GetUserTenants")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
