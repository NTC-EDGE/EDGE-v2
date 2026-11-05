using System;
using System.Collections.Generic;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationActivityDto
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string? ApplicationNumber { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public string ApplicantType { get; set; } = "Individual";
    public string SubmissionMode { get; set; } = "Single";
    public string ServiceName { get; set; } = string.Empty;
    public string? ServiceCategory { get; set; }
    public string? ServiceVariantName { get; set; }
    public string? Element { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? QueueTab { get; set; }
    public string? FieldOffice { get; set; }
    public string? OfficerInCharge { get; set; }
    public string? AssignedTo { get; set; }
    public string? EvaluatingOfficer { get; set; }
    public string? AccountingOfficer { get; set; }
    public string? CashierOfficer { get; set; }
    public string? IssuingOfficer { get; set; }
    public string? EndorsedTo { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime CreatedAt => SubmittedAt;
    public DateTime? UpdatedAt { get; set; }
    public bool IsPinned { get; set; }
    public bool IsArchived { get; set; }
    public string? OfficialReceiptNumber { get; set; }
}

public class PagedApplicationActivitiesDto
{
    public List<ApplicationActivityDto> Items { get; set; } = new();
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 15;
    public int TotalCount { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
