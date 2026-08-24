namespace EDGE.Application.TenantMembers.DTOs;

public class TenantMemberDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserFirstName { get; set; } = string.Empty;
    public string UserLastName { get; set; } = string.Empty;
    public string? UserMiddleName { get; set; }
    public string? UserSuffix { get; set; }
    public string? UserContactNumber { get; set; }
    public string? UserESignature { get; set; }
    public Guid RoleId { get; set; }
    public string RoleKey { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public Guid? FieldOfficeId { get; set; }
    public string? FieldOfficeName { get; set; }
    public string? JobTitle { get; set; }
    public string? Level { get; set; }
    public string Division { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
}
