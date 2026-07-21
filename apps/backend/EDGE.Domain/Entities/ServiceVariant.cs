using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ServiceVariant : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public virtual Service Service { get; set; } = null!;

    public ServiceVariantType Type { get; set; }
    public string? Description { get; set; }
}
