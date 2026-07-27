using System;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ServiceVariant : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public Service? Service { get; set; }
    public ServiceVariantType Type { get; set; }
    public string? Description { get; set; }
    public ICollection<ServiceVariantRequirement> ServiceVariantRequirements { get; set; } = new List<ServiceVariantRequirement>();
}
