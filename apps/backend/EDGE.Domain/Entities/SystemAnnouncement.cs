using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class SystemAnnouncement : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "Info"; // "Info", "Warning", "Maintenance", "Emergency"
    public bool IsActive { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string TargetAudience { get; set; } = "All"; // "All", "Clients", "Staff"
}
