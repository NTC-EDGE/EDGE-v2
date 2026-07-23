using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ServiceVariantRequirement : AuditableEntity
{
    public Guid RequirementId { get; set; }
    public Requirement? Requirement { get; set; }

    public Guid ServiceVariantId { get; set; }
    public ServiceVariant? ServiceVariant { get; set; }

    public string? ApplicationTypeKey { get; set; }
    public bool IsRequired { get; set; } = true;
}
