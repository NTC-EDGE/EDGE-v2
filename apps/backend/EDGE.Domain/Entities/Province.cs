using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Province : BaseEntity
{
    public Guid RegionId { get; set; }
    public Region? Region { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    // Navigation property
    public ICollection<Municipality> Municipalities { get; set; } = new List<Municipality>();
}
