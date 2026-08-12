using System;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationHistoryDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? FromStatus { get; set; }
    public string ToStatus { get; set; } = string.Empty;
    public Guid? PerformedByUserId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string StaffRole { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; }
}

public class CorrectionAuditTrailDto
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string OldValue { get; set; } = string.Empty;
    public string NewValue { get; set; } = string.Empty;
    public string CorrectedByStaff { get; set; } = string.Empty;
    public DateTime CorrectedAt { get; set; }
}
