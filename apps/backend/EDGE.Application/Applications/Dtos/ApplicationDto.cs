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
    public string SubmissionMode { get; set; } = string.Empty;
    public string? DataEntryMethod { get; set; }
    public string? Remarks { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<ApplicationServiceDto> Services { get; set; } = new();
    public List<ApplicantDto> Applicants { get; set; } = new();
    public List<ApplicationRequirementDto> Requirements { get; set; } = new();
}

public class ApplicationServiceDto
{
    public Guid Id { get; set; }
    public Guid? ServiceCategoryId { get; set; }
    public Guid? ServiceId { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public string? ApplicationTypeKey { get; set; }
    public string? DynamicDataJson { get; set; }
}

public class ApplicationRequirementDto
{
    public Guid Id { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid RequirementId { get; set; }
    public Guid? ServiceVariantRequirementId { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
}
