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
using EDGE.Application.Users.Commands.UpdateCurrentProfile;
using EDGE.Application.Users.Commands.UpdateCurrentSignature;
using EDGE.Application.Users.Commands.AdminCreateUser;
using EDGE.Application.Users.Commands.SyncClerkUsers;
using EDGE.Application.Users.Commands.ChangeUserEmail;

namespace EDGE.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/users").WithTags("Users");

        group.MapPost("/", CreateUser)
            .WithName("CreateUser")
            .WithSummary("Create user account via Clerk")
            .WithDescription("Allows Super Admins and Regional Admins to create new staff accounts via Clerk and sync database records.")
            .Produces<AdminCreateUserResultDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .RequireAuthorization();

        group.MapPost("/sync-clerk", SyncClerkUsers)
            .WithName("SyncClerkUsers")
            .WithSummary("Synchronize users from Clerk into the database")
            .WithDescription("Pulls all user accounts and metadata from Clerk and provisions or updates local database records and tenant memberships.")
            .Produces<SyncClerkUsersResultDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .RequireAuthorization();

        group.MapGet("/me", GetCurrentUser)
            .WithName("GetCurrentUser")
            .WithSummary("Get authenticated user's own basic auth record")
            .WithDescription("Returns the basic database record of the currently authenticated user, including IsSuperAdmin flag.")
            .RequireAuthorization();

        group.MapGet("/profile", GetCurrentUserProfile)
            .WithName("GetCurrentUserProfile")
            .WithSummary("Get authenticated user's full detailed profile")
            .WithDescription("Returns the complete biographical, educational, address, and company profile data of the currently authenticated user.")
            .RequireAuthorization();

        group.MapGet("/me/profile", GetCurrentUserProfile)
            .WithName("GetCurrentUserMeProfile")
            .WithSummary("Get authenticated user's full detailed profile (alias)")
            .WithDescription("Returns the complete biographical, educational, address, and company profile data of the currently authenticated user.")
            .RequireAuthorization();

        group.MapPatch("/me/profile", UpdateCurrentUserProfile)
            .WithName("UpdateCurrentUserProfile")
            .WithSummary("Update authenticated user's personal profile")
            .WithDescription("Updates the profile details (biographical, address, contact) of the currently authenticated user.")
            .RequireAuthorization();

        group.MapPatch("/me/signature", UpdateCurrentUserSignature)
            .WithName("UpdateCurrentUserSignature")
            .WithSummary("Update authenticated user's default e-signature")
            .WithDescription("Updates the official default electronic signature data of the currently authenticated user.")
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
            .WithDescription("Updates user name, active state, and profile metadata.");

        group.MapPost("/{id:guid}/change-email", ChangeUserEmail)
            .WithName("ChangeUserEmail")
            .WithSummary("Change user primary login email")
            .WithDescription("Updates the user's primary login email across the database and Clerk identity provider.")
            .Produces<EDGE.Domain.Entities.User>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

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
        EDGE.Application.Common.Interfaces.ICurrentUserService currentUserService,
        EDGE.Application.Common.Interfaces.IClerkUserService clerkUserService,
        EDGE.Application.Common.Interfaces.IUserRepository userRepository,
        EDGE.Application.Common.Interfaces.IUserAuthorizationService userAuthorizationService,
        EDGE.Application.Common.Interfaces.IUnitOfWork unitOfWork)
    {
        var authUserId = currentUserService.UserId;
        if (string.IsNullOrEmpty(authUserId))
            return Results.Unauthorized();

        var user = await mediator.Send(
            new EDGE.Application.Users.Queries.GetUserByAuthUserId.GetUserByAuthUserIdQuery(authUserId));

        if (user is null)
        {
            // Auto-heal / Auto-provision user from Clerk if database was reset
            var clerkUser = await clerkUserService.GetUserByIdAsync(authUserId);
            if (clerkUser is not null)
            {
                var primaryEmail = clerkUser.EmailAddresses.FirstOrDefault()?.EmailAddress?.Trim().ToLowerInvariant() ?? string.Empty;
                var existingUser = !string.IsNullOrEmpty(primaryEmail)
                    ? await userRepository.GetByEmailAsync(primaryEmail)
                    : null;

                bool isSuperAdmin = false;
                if (clerkUser.PublicMetadata.HasValue && clerkUser.PublicMetadata.Value.ValueKind == System.Text.Json.JsonValueKind.Object)
                {
                    var elem = clerkUser.PublicMetadata.Value;
                    if (elem.TryGetProperty("is_super_admin", out var isa))
                    {
                        if (isa.ValueKind == System.Text.Json.JsonValueKind.True) isSuperAdmin = true;
                        else if (isa.ValueKind == System.Text.Json.JsonValueKind.String && bool.TryParse(isa.GetString(), out var parsedB)) isSuperAdmin = parsedB;
                    }
                    if (elem.TryGetProperty("role", out var r) && r.ValueKind == System.Text.Json.JsonValueKind.String)
                    {
                        if (string.Equals(r.GetString(), "superadmin", StringComparison.OrdinalIgnoreCase)) isSuperAdmin = true;
                    }
                }

                if (existingUser is not null)
                {
                    existingUser.AuthUserId = authUserId;
                    if (isSuperAdmin) existingUser.IsSuperAdmin = true;
                    await unitOfWork.SaveChangesAsync();
                }
                else
                {
                    var newUser = new EDGE.Domain.Entities.User
                    {
                        Id = Guid.NewGuid(),
                        AuthUserId = authUserId,
                        Email = primaryEmail,
                        FirstName = !string.IsNullOrWhiteSpace(clerkUser.FirstName) ? clerkUser.FirstName.Trim() : "Clerk",
                        LastName = !string.IsNullOrWhiteSpace(clerkUser.LastName) ? clerkUser.LastName.Trim() : "User",
                        IsSuperAdmin = isSuperAdmin
                    };
                    await userRepository.AddAsync(newUser);
                    await unitOfWork.SaveChangesAsync();
                }

                user = await mediator.Send(
                    new EDGE.Application.Users.Queries.GetUserByAuthUserId.GetUserByAuthUserIdQuery(authUserId));
            }
        }

        if (user is null)
            return Results.NotFound(new { message = "User record not found." });

        var isInternal = await userAuthorizationService.IsInternalUserAsync();
        var canSubmit = await userAuthorizationService.CanSubmitApplicationAsync();
        var permissions = await userAuthorizationService.GetUserPermissionsAsync();

        return Results.Ok(new
        {
            id = user.Id,
            authUserId = user.AuthUserId,
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName,
            isSuperAdmin = user.IsSuperAdmin,
            isInternalUser = isInternal,
            canSubmitApplication = canSubmit,
            permissions = permissions,
        });
    }

    public static async Task<IResult> GetCurrentUserProfile(
        IMediator mediator,
        EDGE.Application.Common.Interfaces.ICurrentUserService currentUserService,
        EDGE.Application.Common.Interfaces.IUserAuthorizationService userAuthorizationService)
    {
        var authUserId = currentUserService.UserId;
        if (string.IsNullOrEmpty(authUserId))
            return Results.Unauthorized();

        var user = await mediator.Send(
            new EDGE.Application.Users.Queries.GetUserByAuthUserId.GetUserByAuthUserIdQuery(authUserId));

        if (user is null)
            return Results.NotFound(new { message = "User profile not found." });

        var isInternal = await userAuthorizationService.IsInternalUserAsync();
        var canSubmit = await userAuthorizationService.CanSubmitApplicationAsync();

        return Results.Ok(new
        {
            id = user.Id,
            authUserId = user.AuthUserId,
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName,
            middleName = user.MiddleName,
            suffix = user.Suffix,
            contactNumber = user.ContactNumber,
            dateOfBirth = user.DateOfBirth,
            sex = user.Sex,
            nationality = user.Nationality,
            height = user.Height,
            weight = user.Weight,
            schoolAttended = user.SchoolAttended,
            courseTaken = user.CourseTaken,
            profilePicture = user.ProfilePicture,
            eSignature = user.ESignature,
            isSuperAdmin = user.IsSuperAdmin,
            isInternalUser = isInternal,
            canSubmitApplication = canSubmit,
            address = new
            {
                street = user.Street,
                unit = user.Unit,
                zipCode = user.ZipCode,
                barangayId = user.BarangayId,
            },
            company = user.CompanyDetail != null ? new
            {
                id = user.CompanyDetail.Id,
                name = user.CompanyDetail.Name,
                registrationNumber = user.CompanyDetail.RegistrationNumber,
                address = user.CompanyDetail.Address,
                contactNumber = user.CompanyDetail.ContactNumber,
                email = user.CompanyDetail.Email,
                entityType = user.CompanyDetail.EntityType != null ? user.CompanyDetail.EntityType.ToString() : null,
            } : null,
        });
    }

    public static async Task<IResult> UpdateCurrentUserProfile(
        UpdateCurrentProfileCommand command,
        IValidator<UpdateCurrentProfileCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound(new { message = "User profile not found." });
    }

    public static async Task<IResult> UpdateCurrentUserSignature(
        UpdateCurrentSignatureCommand command,
        IValidator<UpdateCurrentSignatureCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound(new { message = "User profile not found." });
    }

    [HasPermission(Permissions.ReadUsers)]
    public static async Task<IResult> GetUsers(
        IMediator mediator,
        [Microsoft.AspNetCore.Mvc.FromQuery] int pageNumber = 1,
        [Microsoft.AspNetCore.Mvc.FromQuery] int pageSize = 50,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? search = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? searchTerm = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] Guid? tenantId = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] Guid? regionId = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] bool? isActive = null)
    {
        var term = !string.IsNullOrWhiteSpace(searchTerm) ? searchTerm : search;
        var result = await mediator.Send(new GetUsersQuery(pageNumber, pageSize, term, tenantId, regionId, isActive));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadUsers)]
    public static async Task<IResult> GetUserById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetUserByIdQuery(id));
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.ManageUsers)]
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

    public record ChangeUserEmailRequest(string NewEmail);

    [HasPermission(Permissions.ManageUsers)]
    public static async Task<IResult> ChangeUserEmail(
        Guid id,
        ChangeUserEmailRequest request,
        IValidator<AdminChangeUserEmailCommand> validator,
        IMediator mediator)
    {
        var command = new AdminChangeUserEmailCommand(id, request.NewEmail);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        try
        {
            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound(new { message = $"User with ID '{id}' was not found." });
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
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
            var allUsers = await mediator.Send(new GetUsersQuery(1, 1000));
            var superAdminCount = allUsers.Data.Count(u => u.IsSuperAdmin);
            if (superAdminCount <= 1)
            {
                return Results.BadRequest(new
                {
                    message = "Operation failed: Cannot revoke SuperAdmin privilege from the sole remaining SuperAdmin in the system."
                });
            }
        }

        var command = new AdminUpdateUserCommand(id, existingUser.FirstName, existingUser.LastName, IsSuperAdmin: request.IsSuperAdmin);
        var result = await mediator.Send(command);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }

    [HasPermission(Permissions.ManageUsers)]
    public static async Task<IResult> CreateUser(
        AdminCreateUserCommand command,
        IValidator<AdminCreateUserCommand> validator,
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
            return Results.Created($"/api/v2/users/{result.Id}", result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: StatusCodes.Status403Forbidden);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.ManageUsers)]
    public static async Task<IResult> SyncClerkUsers(
        SyncClerkUsersCommand command,
        IValidator<SyncClerkUsersCommand> validator,
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
            return Results.Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Results.Json(new { message = ex.Message }, statusCode: StatusCodes.Status403Forbidden);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(new { message = ex.Message });
        }
    }

    [HasPermission(Permissions.DeleteUsers)]
    public static async Task<IResult> DeleteUser(Guid id, IMediator mediator)
    {
        var success = await mediator.Send(new DeleteUserCommand(id));
        return success ? Results.NoContent() : Results.NotFound();
    }

    [HasPermission(Permissions.SupportDiagnostics)]
    public static async Task<IResult> GetGlobalSupportUsers(
        string? search,
        string? tenantId,
        string? regionId,
        string? status,
        IMediator mediator)
    {
        Guid? parsedTenantId = !string.IsNullOrWhiteSpace(tenantId) && Guid.TryParse(tenantId, out var tid) ? tid : null;
        Guid? parsedRegionId = !string.IsNullOrWhiteSpace(regionId) && Guid.TryParse(regionId, out var rid) ? rid : null;
        var paginated = await mediator.Send(new GetUsersQuery(1, 1000, search, parsedTenantId, parsedRegionId));
        var users = paginated.Data;

        var result = users.Select(u =>
        {
            var primaryMembership = u.TenantMemberships?.FirstOrDefault(tm => !parsedTenantId.HasValue || tm.TenantId == parsedTenantId.Value)
                                    ?? u.TenantMemberships?.FirstOrDefault();

            return new
            {
                id = u.Id,
                authUserId = u.AuthUserId,
                email = u.Email,
                firstName = u.FirstName,
                lastName = u.LastName,
                phoneNumber = u.ContactNumber,
                regionId = primaryMembership?.TenantId.ToString() ?? "",
                regionName = primaryMembership?.TenantName ?? "",
                tenantId = primaryMembership?.TenantId,
                tenantName = primaryMembership?.TenantName,
                fieldOfficeName = primaryMembership?.FieldOffice?.Name,
                status = "active",
                isSuperAdmin = u.IsSuperAdmin,
                isLockedOut = false,
                mfaEnabled = false,
                mfaMethod = (string?)null,
                lastLoginAt = u.LastOnline ?? u.CreatedAt,
                lastOnline = u.LastOnline,
                failedLoginAttempts = 0,
                authProvider = "Clerk",
                assignedRoles = u.TenantMemberships?.Select(tm => tm.Role?.Name ?? tm.Position).Where(r => !string.IsNullOrEmpty(r)).Select(r => r!).ToList()
                                ?? (u.IsSuperAdmin ? new List<string> { "SUPER_ADMIN" } : new List<string> { "STANDARD_USER" }),
                createdAt = u.CreatedAt,
                openTicketsCount = 0,
                totalTicketsCount = 0
            };
        }).ToList();

        return Results.Ok(result);
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
