using System;

namespace EDGE.Application.Users.Commands.AdminCreateUser;

public class AdminCreateUserResultDto
{
    public Guid Id { get; set; }
    public string AuthUserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string? Suffix { get; set; }
    public string? ContactNumber { get; set; }
    public string RoleKey { get; set; } = string.Empty;
    public Guid? TenantId { get; set; }
    public string? JobTitle { get; set; }
    public string? Level { get; set; }
    public string? Division { get; set; }
    public string? Position { get; set; }
    public string? Designation { get; set; }
    public Guid? FieldOfficeId { get; set; }
    public bool IsSuperAdmin { get; set; }
    public bool InvitationSent { get; set; }
    public DateTime CreatedAt { get; set; }
}
