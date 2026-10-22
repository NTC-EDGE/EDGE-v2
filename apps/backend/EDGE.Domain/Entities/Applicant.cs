using System;
using System.Collections.Generic;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class Applicant : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public bool IsGuest { get; set; }
    public ApplicantType ApplicantType { get; set; }
    public Guid? ApplicantDetailId { get; set; }
    public ApplicantDetail? ApplicantDetail { get; set; }
    public Guid? CompanyDetailId { get; set; }
    public CompanyDetail? CompanyDetail { get; set; }
    public ApplicantStatus Status { get; set; } = ApplicantStatus.Incomplete;
    public string? EvaluationRemarks { get; set; }

    public Guid? ServiceId { get; set; }
    public Service? Service { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public ServiceVariant? ServiceVariant { get; set; }

    public FormSubmission? FormSubmission { get; set; }
}

