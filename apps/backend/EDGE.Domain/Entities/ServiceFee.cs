using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ServiceFee : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public virtual Service? Service { get; set; }
    public Guid FeeId { get; set; }
    public virtual Fee? Fee { get; set; }
    public decimal Amount { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid? ServiceVariantId { get; set; }
    public virtual ServiceVariant? ServiceVariant { get; set; }

    public Guid? ServiceVariantElementId { get; set; }
    public virtual ServiceVariantElement? ServiceVariantElement { get; set; }
}
