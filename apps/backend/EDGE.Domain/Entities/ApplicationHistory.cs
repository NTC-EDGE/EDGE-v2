using System;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ApplicationHistory : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;
    public string Action { get; set; } = string.Empty;
    public ApplicationStatus? FromStatus { get; set; }
    public ApplicationStatus ToStatus { get; set; }
    public Guid PerformedByUserId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string StaffRole { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
