using System;
using System.Collections.Generic;
using MediatR;

namespace EDGE.Application.Users.Queries.GetGlobalSupportUsers;

public record GlobalSupportUserDto
{
    public Guid Id { get; init; }
    public string AuthUserId { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public string RegionId { get; init; } = string.Empty;
    public string RegionName { get; init; } = string.Empty;
    public Guid? TenantId { get; init; }
    public string? TenantName { get; init; }
    public string? FieldOfficeName { get; init; }
    public string Status { get; init; } = "active";
    public bool IsSuperAdmin { get; init; }
    public bool IsLockedOut { get; init; }
    public bool MfaEnabled { get; init; }
    public string? MfaMethod { get; init; }
    public DateTime? LastLoginAt { get; init; }
    public DateTime? LastOnline { get; init; }
    public int FailedLoginAttempts { get; init; }
    public string AuthProvider { get; init; } = "Clerk";
    public List<string> AssignedRoles { get; init; } = new();
    public DateTimeOffset CreatedAt { get; init; }
    public int OpenTicketsCount { get; init; }
    public int TotalTicketsCount { get; init; }
}

public record GetGlobalSupportUsersQuery(
    string? Search = null,
    string? TenantId = null,
    string? RegionId = null,
    string? Status = null
) : IRequest<List<GlobalSupportUserDto>>;
