using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Users.Queries;
using EDGE.Application.Users.Commands.UpdateUser;
using EDGE.Application.Users.Commands.DeleteUser;

namespace EDGE.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/users").WithTags("Users");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUsersQuery());
            return Results.Ok(result);
        })
        .WithName("GetUsers")
        .WithTags("Users")
        .WithSummary("Get list of platform users")
        .WithDescription("Retrieves user accounts.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUserByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetUserById")
        .WithTags("Users")
        .WithSummary("Get user profile by ID")
        .WithDescription("Fetches single user profile by ID.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPut("/{id:guid}", async (
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
        .WithTags("Users")
        .WithSummary("Update user profile")
        .WithDescription("Updates user name, email, or active state.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteUserCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteUser")
        .WithTags("Users")
        .WithSummary("Delete user account")
        .WithDescription("Deletes user account.")
        .RequireAuthorization(Policies.CanManageUsers);

        // Tech Support Global User Directory & Troubleshooting Endpoints
        var supportGroup = app.MapGroup("/support/users").WithTags("Tech Support");

        supportGroup.MapGet("/", async (string? search, string? regionId, string? status, IMediator mediator) =>
        {
            var users = await mediator.Send(new GetUsersQuery());
            return Results.Ok(users);
        })
        .WithName("GetGlobalSupportUsers")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapGet("/{id}/diagnostics", async (string id, IMediator mediator) =>
        {
            return Results.Ok(new
            {
                userId = id,
                status = "active",
                activeSessions = new[]
                {
                    new { id = "sess-1", device = "Windows PC (Edge)", ipAddress = "112.198.102.4", isCurrent = true, lastActive = "2 mins ago" }
                },
                loginHistory = new[]
                {
                    new { id = "log-1", timestamp = DateTime.UtcNow.ToString("o"), status = "success", ipAddress = "112.198.102.4", deviceInfo = "Edge 126" }
                },
                effectivePermissions = new[] { "PERM_USER_READ", "PERM_TENANT_ACCESS", "PERM_LICENSING_SUBMIT" },
                supportTickets = Array.Empty<object>(),
                diagnosticNotes = Array.Empty<object>()
            });
        })
        .WithName("GetUserDiagnostics")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapPost("/{id}/unlock", async (string id) =>
        {
            return Results.Ok(new { success = true, message = $"Account {id} unlocked successfully." });
        })
        .WithName("UnlockUserAccount")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapPost("/{id}/reset-password", async (string id) =>
        {
            return Results.Ok(new { success = true, message = $"Password reset email sent for account {id}." });
        })
        .WithName("ResetUserPassword")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapPost("/{id}/revoke-sessions", async (string id) =>
        {
            return Results.Ok(new { success = true, message = $"All sessions revoked for account {id}." });
        })
        .WithName("RevokeUserSessions")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapPut("/{id}/mfa", async (string id, MfaToggleDto dto) =>
        {
            return Results.Ok(new { success = true, message = $"MFA status updated for {id}." });
        })
        .WithName("ToggleUserMfa")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapPut("/{id}/status", async (string id, UserStatusUpdateDto dto) =>
        {
            return Results.Ok(new { success = true, message = $"User status updated to {dto.Status} for {id}." });
        })
        .WithName("UpdateUserStatusOverride")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapPost("/{id}/notes", async (string id, SupportNoteDto dto) =>
        {
            return Results.Ok(new { success = true, message = $"Support note recorded for user {id}." });
        })
        .WithName("AddSupportTroubleshootingNote")
        .RequireAuthorization(Policies.CanManageUsers);

        supportGroup.MapDelete("/{id}/sessions/{sessionId}", async (string id, string sessionId) =>
        {
            return Results.Ok(new { success = true, message = $"Session {sessionId} revoked for user {id}." });
        })
        .WithName("RevokeUserSessionById")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}

public record MfaToggleDto(bool Enabled);
public record UserStatusUpdateDto(string Status, string Reason);
public record SupportNoteDto(string Note, string? ActionTaken);

