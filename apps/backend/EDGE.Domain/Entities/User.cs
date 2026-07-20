using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class User : BaseEntity
{
    public string ClerkId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // Navigation property
    public virtual ICollection<TenantMember> TenantMembers { get; set; } = new List<TenantMember>();
}
