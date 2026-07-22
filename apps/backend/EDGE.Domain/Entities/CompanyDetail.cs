using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class CompanyDetail : AuditableEntity
{
    public Guid BarangayId { get; set; }
    public Barangay? Barangay { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public CompanyEntityType? EntityType { get; set; }
}
