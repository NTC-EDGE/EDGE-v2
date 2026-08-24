using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

/// <summary>
/// Maps a master Requirement to a specific ServiceVariant.
/// </summary>
public class ServiceVariantRequirement : AuditableEntity
{
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }

    public Guid RequirementId { get; set; }
    public Requirement? Requirement { get; set; }

    public Guid ServiceVariantId { get; set; }
    public ServiceVariant? ServiceVariant { get; set; }

    public bool IsRequired { get; set; } = true;
}
