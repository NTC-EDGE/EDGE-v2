using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ApplicationRequirement : AuditableEntity
{
    public Guid ApplicationId { get; set; }
    public Application? Application { get; set; }

    public Guid ApplicantId { get; set; }
    public Applicant? Applicant { get; set; }

    public Guid RequirementId { get; set; }
    public Requirement? Requirement { get; set; }

    public Guid? ServiceVariantRequirementId { get; set; }
    public ServiceVariantRequirement? ServiceVariantRequirement { get; set; }

    public Guid? StoredFileId { get; set; }
    public StoredFile? StoredFile { get; set; }

    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public string? ApprovedBy { get; set; }
}
