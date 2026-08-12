using System;
using System.Collections.Generic;

namespace EDGE.Application.Applications.Dtos;

public class StatementOfAccountDto
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Guid? ApplicantId { get; set; }
    public string SoaNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string IssuedToType { get; set; } = string.Empty;
    public string IssuedToName { get; set; } = string.Empty;
    public string? IssuedToAddress { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime DueDate { get; set; }
    public Guid? PreparedByUserId { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? Remarks { get; set; }
    public List<SoaLineItemDto> LineItems { get; set; } = new();
    public List<SoaHistoryDto> Histories { get; set; } = new();
}

public class SoaLineItemDto
{
    public Guid Id { get; set; }
    public string Particular { get; set; } = string.Empty;
    public string ItemCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? PeriodOfCoverageStart { get; set; }
    public DateTime? PeriodOfCoverageEnd { get; set; }
    public int ValidityYears { get; set; }
    public int NoOfUnits { get; set; }
    public decimal FeeRate { get; set; }
    public decimal Amount { get; set; }
}

public class SoaHistoryDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? FromStatus { get; set; }
    public string ToStatus { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public string StaffRole { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; }
}
