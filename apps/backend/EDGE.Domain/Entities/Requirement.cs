using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Requirement : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<ServiceVariantRequirement> ServiceVariantRequirements { get; set; } = new List<ServiceVariantRequirement>();
}
