using System;

namespace EDGE.Application.Applications.Commands.IssueApplication;

public record IssuedDocumentDto
{
    public Guid Id { get; init; }
    public Guid ApplicationId { get; init; }
    public Guid? ApplicantId { get; init; }
    public string DocumentType { get; init; } = "Certificate";
    public string FormNumber { get; init; } = string.Empty;
    public string? LicenseNumber { get; init; }
    public string? CallSign { get; init; }
    public string? StationClass { get; init; }
    public string? FrequencyBand { get; init; }
    public DateTime IssueDate { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public string IssuedByStaffName { get; init; } = string.Empty;
    public string? OriginalEvaluatorName { get; init; }
    public bool IsAlternateIssuer { get; init; }
    public string? OfficialReceiptNumber { get; init; }
    public string? QrVerificationCode { get; init; }
    public string? DocumentFileUrl { get; init; }
    public string? Remarks { get; init; }
}
