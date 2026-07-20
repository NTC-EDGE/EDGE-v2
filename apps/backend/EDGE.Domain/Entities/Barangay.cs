using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Barangay : BaseEntity
{
    public Guid MunicipalityId { get; set; }
    public Municipality? Municipality { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
