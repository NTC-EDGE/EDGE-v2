using System;
using System.Collections.Generic;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ScheduleId { get; set; }
    public Guid? RegionId { get; set; }
    public string? Office { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string QueueTab { get; set; } = "activity";
    public string SubmissionMode { get; set; } = string.Empty;
    public string? DataEntryMethod { get; set; }
    public string? Remarks { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; }
    public bool IsPinned { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public Guid? ServiceCategoryId { get; set; }
    public string? ServiceCategory { get; set; }
    public string? ServiceCategoryName { get; set; }
    public string? ServiceCategoryCode { get; set; }
    public string? ServiceVariantName { get; set; }

    public FilingUserDto? FilingUser { get; set; }

    public List<ApplicationServiceDto> Services { get; set; } = new();
    public List<ApplicantDto> Applicants { get; set; } = new();
    public List<ApplicationRequirementDto> Requirements { get; set; } = new();
    public List<FormSubmissionSummaryDto> FormSubmissions { get; set; } = new();
    
    public List<StatementOfAccountDto> StatementsOfAccount { get; set; } = new();
    public List<OrderOfPaymentDto> OrdersOfPayment { get; set; } = new();
    public List<ApplicationHistoryDto> Histories { get; set; } = new();
    public List<CorrectionAuditTrailDto> CorrectionAuditTrails { get; set; } = new();
}

public class FilingUserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AccountType { get; set; } = "Individual";
    public CompanyDetailDto? Company { get; set; }
}

public class ApplicationServiceDto
{
    public Guid Id { get; set; }
    public Guid? ApplicantId { get; set; }
    public Guid? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceCategory { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public string? ServiceVariantName { get; set; }
    public Guid? SubmissionId { get; set; }
}

public class ApplicationRequirementDto
{
    public Guid Id { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid? ApplicationServiceId { get; set; }
    public Guid RequirementId { get; set; }
    public Guid? ServiceVariantRequirementId { get; set; }
    public Guid? StoredFileId { get; set; }
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public long? FileSizeBytes { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
}

