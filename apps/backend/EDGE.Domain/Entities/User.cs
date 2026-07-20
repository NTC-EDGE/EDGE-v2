using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class User : AuditableEntity
{
    public string AuthUserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;

    public Guid? BarangayId { get; set; }
    public string? MiddleName { get; set; }
    public string? Suffix { get; set; }
    public string? Unit { get; set; }
    public string? Street { get; set; }
    public string? ZipCode { get; set; }
    public string? ContactNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Sex { get; set; }
    public string? Nationality { get; set; }
    public float? Height { get; set; }
    public float? Weight { get; set; }
    public string? SchoolAttended { get; set; }
    public string? CourseTaken { get; set; }
    public string? ProfilePicture { get; set; }
    public bool? IsOnline { get; set; }
    public DateTime? LastOnline { get; set; }
    public string? ESignature { get; set; }
}
