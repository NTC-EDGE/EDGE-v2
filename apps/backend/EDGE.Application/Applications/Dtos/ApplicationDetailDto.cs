using System;
using System.Collections.Generic;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationDetailDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ScheduleId { get; set; }
    public Guid? RegionId { get; set; }
    public string? Office { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string SubmissionMode { get; set; } = string.Empty;
    public string? DataEntryMethod { get; set; }
    public string? Remarks { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; }
    public bool IsPinned { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }

    public FilingUserDto? FilingUser { get; set; }

    public List<StatementOfAccountDto> StatementsOfAccount { get; set; } = new();
    public List<OrderOfPaymentDto> OrdersOfPayment { get; set; } = new();
    public List<ApplicationHistoryDto> Histories { get; set; } = new();
    public List<CorrectionAuditTrailDto> CorrectionAuditTrails { get; set; } = new();
}
