using System;
using System.Collections.Generic;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationSummaryDto
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
    public List<ApplicationServiceDto> Services { get; set; } = new();
    public List<ApplicantSummaryDto> Applicants { get; set; } = new();
    public List<StatementOfAccountSummaryDto> StatementsOfAccount { get; set; } = new();
    public List<OrderOfPaymentSummaryDto> OrdersOfPayment { get; set; } = new();
}

public class ApplicantSummaryDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; }
    public string ApplicantType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? EvaluationRemarks { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ContactNumber { get; set; }
    public string? EmailAddress { get; set; }
    public CompanyDetailDto? Company { get; set; }
}

public class StatementOfAccountSummaryDto
{
    public Guid Id { get; set; }
    public string SoaNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime DueDate { get; set; }
}

public class OrderOfPaymentSummaryDto
{
    public Guid Id { get; set; }
    public string OpNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal AmountDue { get; set; }
    public decimal AmountReceived { get; set; }
    public string? OfficialReceiptNumber { get; set; }
    public DateTime? PaidAt { get; set; }
}
