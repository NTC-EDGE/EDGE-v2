using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Feedback : AuditableEntity
{
    public Guid? TenantId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public string Status { get; set; } = "Pending"; // "Pending", "Reviewed", "Resolved"
    public bool IsAnonymous { get; set; } = false;
}
