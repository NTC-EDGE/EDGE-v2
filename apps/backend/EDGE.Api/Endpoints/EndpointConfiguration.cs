using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Models;
using EDGE.Domain.Enums;
using EDGE.Application.Applications.Commands;
using EDGE.Application.Applications.Queries;
using EDGE.Application.Users.Queries;
using EDGE.Application.Users.Commands.CreateUser;
using EDGE.Application.Users.Commands.UpdateUser;
using EDGE.Application.Users.Commands.DeleteUser;
using EDGE.Application.Users.Queries.GetUserByAuthUserId;
using EDGE.Application.Roles.Queries;
using EDGE.Application.Roles.Commands;
using EDGE.Application.Permissions.Queries;
using EDGE.Application.RolePermissions.Commands;
using EDGE.Application.Common.Interfaces;
using EDGE.Api.Filters;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using EDGE.Infrastructure.Hubs;

namespace EDGE.Api.Endpoints;

public static class EndpointConfiguration
{
    public static void MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        // ----------------------------------------------------
        // Webhooks (Clerk Sync)
        // ----------------------------------------------------
        app.MapPost("/webhooks/clerk", async (
            HttpContext httpContext,
            IMediator mediator,
            IClerkUserService clerkUserService) =>
        {
            if (httpContext.Items["ClerkWebhookPayload"] is not ClerkWebhookPayload payload)
            {
                return Results.BadRequest("Payload not available");
            }

            if (string.IsNullOrEmpty(payload.Type) || payload.Data is null)
            {
                return Results.BadRequest("Invalid webhook payload structure");
            }

            var success = false;
            var message = string.Empty;

            switch (payload.Type)
            {
                case "user.created":
                    if (payload.Data is ClerkUserData createData)
                    {
                        var cmd = new CreateUserCommand(
                            createData.Id,
                            createData.EmailAddresses.FirstOrDefault()?.EmailAddress ?? "",
                            createData.FirstName ?? "",
                            createData.LastName ?? "",
                            "client"
                        );
                        await mediator.Send(cmd);
                        success = true;
                    }
                    break;

                case "user.updated":
                    if (payload.Data is ClerkUserData updateData)
                    {
                        var cmd = new UpdateUserCommand(
                            updateData.Id,
                            updateData.EmailAddresses.FirstOrDefault()?.EmailAddress ?? "",
                            updateData.FirstName ?? "",
                            updateData.LastName ?? ""
                        );
                        await mediator.Send(cmd);
                        success = true;
                    }
                    break;

                case "session.created":
                    if (payload.Data is ClerkSessionData sessionData)
                    {
                        var user = await mediator.Send(new GetUserByAuthUserIdQuery(sessionData.UserId));
                        if (user == null)
                        {
                            var clerkUser = await clerkUserService.GetUserByIdAsync(sessionData.UserId);
                            if (clerkUser != null)
                            {
                                var cmd = new CreateUserCommand(
                                    clerkUser.Id,
                                    clerkUser.EmailAddresses.FirstOrDefault()?.EmailAddress ?? "",
                                    clerkUser.FirstName ?? "",
                                    clerkUser.LastName ?? "",
                                    "client"
                                );
                                await mediator.Send(cmd);
                            }
                        }
                        success = true;
                    }
                    break;

                default:
                    message = "Unsupported webhook event type";
                    break;
            }

            return success ? Results.Ok(new { Succeeded = true }) : Results.BadRequest(new { Succeeded = false, Message = message });
        })
        .WithName("HandleClerkWebhook")
        .AddEndpointFilter<ClerkWebhookVerificationFilter>()
        .AllowAnonymous();

        // ----------------------------------------------------
        // Applications CRUD
        // ----------------------------------------------------
        var applications = app.MapGroup("/api/applications");

        applications.MapPost("/", async (
            CreateApplicationCommand command,
            IValidator<CreateApplicationCommand> validator,
            IMediator mediator,
            IBackgroundJobClient backgroundJobs,
            IHubContext<NotificationHub> hubContext) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);

            backgroundJobs.Enqueue(() => Console.WriteLine($"[Hangfire Job] Processed application: {result.Title} by {result.ApplicantName}"));
            await hubContext.Clients.All.SendAsync("ReceiveNotification", $"New application submitted: '{result.Title}'");

            return Results.Created($"/api/applications/{result.Id}", result);
        })
        .WithName("CreateApplication")
        .RequireAuthorization(Policies.CanSubmitApplication);

        applications.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetApplicationsQuery());
            return Results.Ok(result);
        })
        .WithName("GetApplications")
        .RequireAuthorization(Policies.CanViewAllApplications);

        applications.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetApplicationQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetApplicationById")
        .RequireAuthorization(Policies.CanViewAllApplications);

        applications.MapPut("/{id:guid}", async (
            Guid id,
            UpdateApplicationCommand command,
            IValidator<UpdateApplicationCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest("Route ID does not match request body ID.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("UpdateApplication")
        .RequireAuthorization(Policies.CanEvaluateApplication);

        applications.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteApplicationCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteApplication")
        .RequireAuthorization(Policies.AdminOnly);

        // ----------------------------------------------------
        // Users CRUD
        // ----------------------------------------------------
        var users = app.MapGroup("/api/users");

        users.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUsersQuery());
            return Results.Ok(result);
        })
        .WithName("GetUsers")
        .RequireAuthorization(Policies.CanManageUsers);

        users.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUserByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetUserById")
        .RequireAuthorization(Policies.CanManageUsers);

        users.MapPut("/{id:guid}", async (
            Guid id,
            AdminUpdateUserCommand command,
            IValidator<AdminUpdateUserCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest("Route ID does not match request body ID.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("UpdateUser")
        .RequireAuthorization(Policies.CanManageUsers);

        users.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteUserCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteUser")
        .RequireAuthorization(Policies.CanManageUsers);

        // ----------------------------------------------------
        // Roles CRUD
        // ----------------------------------------------------
        var roles = app.MapGroup("/api/roles");

        roles.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRolesQuery());
            return Results.Ok(result);
        })
        .WithName("GetRoles")
        .RequireAuthorization(Policies.CanManageUsers);

        roles.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetRoleByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetRoleById")
        .RequireAuthorization(Policies.CanManageUsers);

        roles.MapPost("/", async (
            CreateRoleCommand command,
            IValidator<CreateRoleCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/roles/{result.Id}", result);
        })
        .WithName("CreateRole")
        .RequireAuthorization(Policies.CanManageUsers);

        roles.MapPut("/{id:guid}", async (
            Guid id,
            UpdateRoleCommand command,
            IValidator<UpdateRoleCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest("Route ID does not match request body ID.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("UpdateRole")
        .RequireAuthorization(Policies.CanManageUsers);

        roles.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteRoleCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteRole")
        .RequireAuthorization(Policies.CanManageUsers);

        // ----------------------------------------------------
        // Permissions List
        // ----------------------------------------------------
        var permissions = app.MapGroup("/api/permissions");

        permissions.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetPermissionsQuery());
            return Results.Ok(result);
        })
        .WithName("GetPermissions")
        .RequireAuthorization(Policies.CanManageUsers);

        // ----------------------------------------------------
        // Role Permissions Assignment
        // ----------------------------------------------------
        var rolepermissions = app.MapGroup("/api/rolepermissions");

        rolepermissions.MapPost("/assign", async (
            AssignPermissionCommand command,
            IValidator<AssignPermissionCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success ? Results.Ok(new { Message = "Permission assigned successfully." }) : Results.BadRequest("Could not assign permission.");
        })
        .WithName("AssignRolePermission")
        .RequireAuthorization(Policies.CanManageUsers);

        rolepermissions.MapPost("/revoke", async (
            RevokePermissionCommand command,
            IValidator<RevokePermissionCommand> validator,
            IMediator mediator) =>
        {
            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var success = await mediator.Send(command);
            return success ? Results.Ok(new { Message = "Permission revoked successfully." }) : Results.NotFound("Mapping not found.");
        })
        .WithName("RevokeRolePermission")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
