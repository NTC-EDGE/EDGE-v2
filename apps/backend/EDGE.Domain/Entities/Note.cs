using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Note : AuditableEntity
{
    public string Notes { get; set; } = string.Empty;

    public Guid ServiceId { get; set; }
    public virtual Service? Service { get; set; }

    public Guid? ServiceVariantId { get; set; }
    public virtual ServiceVariant? ServiceVariant { get; set; }
}
