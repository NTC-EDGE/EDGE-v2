using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ServiceVariantElementFee : AuditableEntity
{
    public Guid ServiceVariantId { get; set; }
    public virtual ServiceVariant? ServiceVariant { get; set; }

    public Guid ElementId { get; set; }
    public virtual Element? Element { get; set; }

    public Guid FeeId { get; set; }
    public virtual Fee? Fee { get; set; }

    public decimal Amount { get; set; }
    public bool IsActive { get; set; } = true;
}
