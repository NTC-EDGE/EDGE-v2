using System;
using System.Collections.Generic;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationSummaryDto
{
    public Guid Id { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string SubmissionMode { get; set; } = string.Empty;
    public string? Office { get; set; }
    public string? Remarks { get; set; }
    public bool IsGuest { get; set; }
    public bool IsPinned { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }

    public FilingUserSummaryDto? FilingUser { get; set; }
    public List<ServiceSummaryDto> Services { get; set; } = new();
    public List<ApplicantSummaryDto> Applicants { get; set; } = new();
}

public class FilingUserSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AccountType { get; set; } = "Individual";
    public CompanyDetailDto? Company { get; set; }
}

public class ServiceSummaryDto
{
    public Guid Id { get; set; }
    public Guid? ServiceCategoryId { get; set; }
    public Guid? ServiceId { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public string? ApplicationTypeKey { get; set; }
}

public class ApplicantSummaryDto
{
    public Guid Id { get; set; }
    public string ApplicantType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CompanyDetailDto? Company { get; set; }
}
