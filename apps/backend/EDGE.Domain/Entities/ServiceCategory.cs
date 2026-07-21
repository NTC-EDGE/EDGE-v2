using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ServiceCategory : AuditableEntity
{
    public ServiceCategoryType Type { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }

    public virtual List<Service> Services { get; set; } = [];
}
