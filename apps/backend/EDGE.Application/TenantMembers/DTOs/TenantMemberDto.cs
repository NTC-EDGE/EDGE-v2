namespace EDGE.Application.TenantMembers.DTOs;

public record TenantMemberDto(
    Guid UserId,
    string FullName,
    string Email,
    Guid TenantId,
    string TenantName,
    Guid RoleId,
    string RoleName,
    string RoleKey,
    bool IsActive,
    DateTime JoinedAt
);
