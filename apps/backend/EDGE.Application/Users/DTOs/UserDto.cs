using System;
using System.Collections.Generic;

namespace EDGE.Application.Users.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public string AuthUserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string? Suffix { get; set; }
    public string? ContactNumber { get; set; }
    public string? ProfilePicture { get; set; }
    public string? ESignature { get; set; }
    public bool IsSuperAdmin { get; set; }
    public bool? IsOnline { get; set; }
    public DateTime? LastOnline { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<UserTenantMembershipDto> TenantMemberships { get; set; } = new();
}

public class UserTenantMembershipDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string? TenantName { get; set; }
    public Guid? RegionId { get; set; }
    public string? RegionName { get; set; }
    public Guid RoleId { get; set; }
    public UserRoleDto? Role { get; set; }
    public Guid? FieldOfficeId { get; set; }
    public UserFieldOfficeDto? FieldOffice { get; set; }
    public string? JobTitle { get; set; }
    public string? Level { get; set; }
    public string? Division { get; set; }
    public string? Position { get; set; }
    public string? Designation { get; set; }
}

public class UserRoleDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class UserFieldOfficeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
