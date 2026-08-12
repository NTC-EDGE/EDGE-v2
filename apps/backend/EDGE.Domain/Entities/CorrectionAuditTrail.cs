using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class CorrectionAuditTrail : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;
    public string Category { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    public string CorrectedByStaff { get; set; } = string.Empty;
    public DateTime CorrectedAt { get; set; } = DateTime.UtcNow;
}
