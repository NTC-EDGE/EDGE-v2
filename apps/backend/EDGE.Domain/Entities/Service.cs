using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Service : AuditableEntity
{
    public Guid ServiceCategoryId { get; set; }
    public ServiceCategory? ServiceCategory { get; set; }
    public Guid? TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Group { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public string Contract { get; set; } = string.Empty; // JSON column
    public ICollection<ServiceVariant> ServiceVariants { get; set; } = new List<ServiceVariant>();
    public virtual ICollection<ServiceFee> ServiceFees { get; set; } = new List<ServiceFee>();
    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public virtual ICollection<ServiceNote> ServiceNotes { get; set; } = new List<ServiceNote>();
}
