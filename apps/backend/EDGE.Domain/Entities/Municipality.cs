using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Municipality : BaseEntity
{
    public Guid ProvinceId { get; set; }
    public Province? Province { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    // Navigation property
    public ICollection<Barangay> Barangays { get; set; } = new List<Barangay>();
}
