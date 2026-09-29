using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class IssuedDocumentDetail : AuditableEntity
{
    public Guid ApplicationId { get; set; }
    public Application? Application { get; set; }

    public Guid? ApplicantId { get; set; }
    public Applicant? Applicant { get; set; }

    public string DocumentType { get; set; } = "Certificate"; // Certificate | License | Permit | Accreditation
    public string FormNumber { get; set; } = string.Empty;
    public string? LicenseNumber { get; set; }
    public string? CallSign { get; set; }
    public string? StationClass { get; set; }
    public string? FrequencyBand { get; set; }

    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }

    // Multi-Evaluator / Regional Pool tracking
    public Guid? OriginalEvaluatorUserId { get; set; }
    public string? OriginalEvaluatorName { get; set; }
    public Guid? IssuedByUserId { get; set; }
    public string IssuedByStaffName { get; set; } = string.Empty;
    public bool IsAlternateIssuer { get; set; } = false;

    // Financial cross-reference & verification
    public string? OfficialReceiptNumber { get; set; }
    public string? QrVerificationCode { get; set; }
    public string? DocumentFileUrl { get; set; }
    public string? Remarks { get; set; }
}
