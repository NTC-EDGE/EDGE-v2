using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Region : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    // Navigation property
    public ICollection<Province> Provinces { get; set; } = new List<Province>();
    public ICollection<FieldOffice> FieldOffices { get; set; } = new List<FieldOffice>();
}
