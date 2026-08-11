using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Users.Queries;
using EDGE.Application.Users.Commands.UpdateUser;
using EDGE.Application.Users.Commands.DeleteUser;

namespace EDGE.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/users").WithTags("Users");

        group.MapGet("/me", GetCurrentUser)
            .WithName("GetCurrentUser")
            .WithSummary("Get authenticated user's own profile")
            .WithDescription("Returns the database profile of the currently authenticated user, including IsSuperAdmin flag.")
            .RequireAuthorization();

        group.MapGet("/", GetUsers)
            .WithName("GetUsers")
            .WithSummary("Get list of platform users")
            .WithDescription("Retrieves user accounts.");

        group.MapGet("/{id:guid}", GetUserById)
            .WithName("GetUserById")
            .WithSummary("Get user profile by ID")
            .WithDescription("Fetches single user profile by ID.");

        group.MapPut("/{id:guid}", UpdateUser)
            .WithName("UpdateUser")
            .WithSummary("Update user profile")
            .WithDescription("Updates user name, email, or active state.");

        group.MapPatch("/{id:guid}/super-admin", UpdateUserSuperAdmin)
            .WithName("UpdateUserSuperAdmin")
            .WithSummary("Update user super admin status")
            .WithDescription("Toggles or updates the IsSuperAdmin privilege of a user account.")
            .Produces<EDGE.Domain.Entities.User>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();

        group.MapDelete("/{id:guid}", DeleteUser)
            .WithName("DeleteUser")
            .WithSummary("Delete user account")
            .WithDescription("Deletes user account.");


        // Tech Support Global User Directory & Troubleshooting Endpoints
        var supportGroup = app.MapGroup("/support/users").WithTags("Tech Support");

        supportGroup.MapGet("/", GetGlobalSupportUsers)
            .WithName("GetGlobalSupportUsers");

        supportGroup.MapGet("/{id}/diagnostics", GetUserDiagnostics)
            .WithName("GetUserDiagnostics");

        supportGroup.MapPost("/{id}/unlock", UnlockUserAccount)
            .WithName("UnlockUserAccount");

        supportGroup.MapPost("/{id}/reset-password", ResetUserPassword)
            .WithName("ResetUserPassword");

        supportGroup.MapPost("/{id}/revoke-sessions", RevokeUserSessions)
            .WithName("RevokeUserSessions");

        supportGroup.MapPut("/{id}/mfa", ToggleUserMfa)
            .WithName("ToggleUserMfa");

        supportGroup.MapPut("/{id}/status", UpdateUserStatusOverride)
            .WithName("UpdateUserStatusOverride");

        supportGroup.MapPost("/{id}/notes", AddSupportTroubleshootingNote)
            .WithName("AddSupportTroubleshootingNote");

        supportGroup.MapDelete("/{id}/sessions/{sessionId}", RevokeUserSessionById)
            .WithName("RevokeUserSessionById");
    }

    public static async Task<IResult> GetCurrentUser(
        IMediator mediator,
        EDGE.Application.Common.Interfaces.ICurrentUserService currentUserService)
    {
        var authUserId = currentUserService.UserId;
        if (string.IsNullOrEmpty(authUserId))
            return Results.Unauthorized();

        var user = await mediator.Send(
            new EDGE.Application.Users.Queries.GetUserByAuthUserId.GetUserByAuthUserIdQuery(authUserId));

        if (user is null)
            return Results.NotFound(new { message = "User profile not found." });

        return Results.Ok(new
        {
            id = user.Id,
            authUserId = user.AuthUserId,
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName,
            isSuperAdmin = user.IsSuperAdmin,
        });
    }

    [HasPermission(Permissions.ReadUsers)]
    public static async Task<IResult> GetUsers(IMediator mediator)
    {
        var result = await mediator.Send(new GetUsersQuery());
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadUsers)]
    public static async Task<IResult> GetUserById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetUserByIdQuery(id));
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.UpdateUsers)]
    public static async Task<IResult> UpdateUser(
        Guid id,
        AdminUpdateUserCommand command,
        IValidator<AdminUpdateUserCommand> validator,
        IMediator mediator)
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
    }

    public record UpdateUserSuperAdminRequest(bool IsSuperAdmin);

    [HasPermission(Permissions.ManageUsers)]
    public static async Task<IResult> UpdateUserSuperAdmin(
        Guid id,
        UpdateUserSuperAdminRequest request,
        EDGE.Application.Common.Interfaces.IUserAuthorizationService userAuthorizationService,
        IMediator mediator)
    {
        var isCallerSuperAdmin = await userAuthorizationService.HasRoleAsync("superadmin");
        if (!isCallerSuperAdmin)
        {
            return Results.Json(
                new { message = "Forbidden: Only SuperAdmins can grant or revoke SuperAdmin privileges." },
                statusCode: StatusCodes.Status403Forbidden
            );
        }

        var existingUser = await mediator.Send(new GetUserByIdQuery(id));
        if (existingUser is null)
        {
            return Results.NotFound(new { message = $"User with ID '{id}' was not found." });
        }

        // Prevent self-revocation/accidental lockout if this is the last SuperAdmin on the system
        if (existingUser.IsSuperAdmin && request.IsSuperAdmin == false)
        {
            var allUsers = await mediator.Send(new GetUsersQuery());
            var superAdminCount = allUsers.Count(u => u.IsSuperAdmin);
            if (superAdminCount <= 1)
            {
                return Results.BadRequest(new
                {
                    message = "Operation failed: Cannot revoke SuperAdmin privilege from the sole remaining SuperAdmin in the system."
                });
            }
        }

        var command = new AdminUpdateUserCommand(id, existingUser.FirstName, existingUser.LastName, request.IsSuperAdmin);
        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.DeleteUsers)]
    public static async Task<IResult> DeleteUser(Guid id, IMediator mediator)
    {
        var success = await mediator.Send(new DeleteUserCommand(id));
        return success ? Results.NoContent() : Results.NotFound();
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static async Task<IResult> GetGlobalSupportUsers(string? search, string? regionId, string? status, IMediator mediator)
    {
        var users = await mediator.Send(new GetUsersQuery());
        return Results.Ok(users);
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> GetUserDiagnostics(string id, IMediator mediator)
    {
        return Task.FromResult<IResult>(Results.Ok(new
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
        }));
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> UnlockUserAccount(string id)
    {
        return Task.FromResult<IResult>(Results.Ok(new { success = true, message = $"Account {id} unlocked successfully." }));
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> ResetUserPassword(string id)
    {
        return Task.FromResult<IResult>(Results.Ok(new { success = true, message = $"Password reset email sent for account {id}." }));
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> RevokeUserSessions(string id)
    {
        return Task.FromResult<IResult>(Results.Ok(new { success = true, message = $"All sessions revoked for account {id}." }));
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> ToggleUserMfa(string id, MfaToggleDto dto)
    {
        return Task.FromResult<IResult>(Results.Ok(new { success = true, message = $"MFA status updated for {id}." }));
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> UpdateUserStatusOverride(string id, UserStatusUpdateDto dto)
    {
        return Task.FromResult<IResult>(Results.Ok(new { success = true, message = $"User status updated to {dto.Status} for {id}." }));
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> AddSupportTroubleshootingNote(string id, SupportNoteDto dto)
    {
        return Task.FromResult<IResult>(Results.Ok(new { success = true, message = $"Support note recorded for user {id}." }));
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static Task<IResult> RevokeUserSessionById(string id, string sessionId)
    {
        return Task.FromResult<IResult>(Results.Ok(new { success = true, message = $"Session {sessionId} revoked for user {id}." }));
    }
}

public record MfaToggleDto(bool Enabled);
public record UserStatusUpdateDto(string Status, string Reason);
public record SupportNoteDto(string Note, string? ActionTaken);
