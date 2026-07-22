using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ServiceCategory : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public ServiceCategoryType Type { get; set; }
    public virtual ICollection<Service> Services { get; set; } = new List<Service>();
}
