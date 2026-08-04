using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Schedule : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public Guid TenantId { get; set; }

    public string Venue { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? StartApplication { get; set; }
    public DateTime? EndApplication { get; set; }
    public bool IsPublished { get; set; } = false;
    public int? MaximumSlots { get; set; }
    public string? Remarks { get; set; }

    // Navigation properties (prepared for future integration once other entities are available):
    public virtual Service? Service { get; set; }
    public virtual Tenant? Tenant { get; set; }
    // public virtual ApplicationRecord? Application { get; set; }
}
