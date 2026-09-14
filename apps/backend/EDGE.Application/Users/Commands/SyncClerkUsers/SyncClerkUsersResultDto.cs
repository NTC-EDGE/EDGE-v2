using System;
using System.Collections.Generic;

namespace EDGE.Application.Users.Commands.SyncClerkUsers;

public class SyncedUserSummaryDto
{
    public Guid Id { get; set; }
    public string AuthUserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsSuperAdmin { get; set; }
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public string? RoleKey { get; set; }
    public string Action { get; set; } = "synced"; // "created", "updated", "linked"
}

public class SyncClerkUsersResultDto
{
    public int TotalClerkUsers { get; set; }
    public int CreatedUsers { get; set; }
    public int UpdatedUsers { get; set; }
    public int TenantMembershipsCreated { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<SyncedUserSummaryDto> SyncedUsers { get; set; } = new();
}
