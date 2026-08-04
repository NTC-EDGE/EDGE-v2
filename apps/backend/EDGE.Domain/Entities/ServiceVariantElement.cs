using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ServiceVariantElement : AuditableEntity
{
    public Guid ServiceVariantId { get; set; }
    public ServiceVariant? ServiceVariant { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
