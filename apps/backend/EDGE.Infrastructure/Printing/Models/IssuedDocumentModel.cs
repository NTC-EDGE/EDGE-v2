using System;

namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// Printable Issued Document, License, Permit, or Certificate model.
/// Represents the completed statutory authorization issued to a client post-payment.
/// </summary>
public class IssuedDocumentModel
{
    public string DocumentTitle { get; set; } = "RADIO STATION LICENSE";
    public string DocumentType { get; set; } = "License"; // License | Certificate | Permit | Accreditation
    public string FormNumber { get; set; } = string.Empty;
    public string? LicenseNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? ApplicationNumber { get; set; }

    // Licensee / Grantee
    public string LicenseeName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }

    // Technical / Station Specifications
    public string? CallSign { get; set; }
    public string? StationClass { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceCategory { get; set; }
    public string? FrequencyBand { get; set; }
    public string? EquipmentDetails { get; set; }
    public string? LocationOrServiceArea { get; set; }

    // Validity & Financial Cross-Reference
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }
    public string? OfficialReceiptNumber { get; set; }
    public decimal? AmountPaid { get; set; }

    // Integrity & Signatories
    public string? QrVerificationCode { get; set; }
    public string SignatoryName { get; set; } = "REGIONAL DIRECTOR";
    public string SignatoryTitle { get; set; } = "Regional Director / Authorized Signatory";
    public string OfficeName { get; set; } = "NATIONAL TELECOMMUNICATIONS COMMISSION";
    public string? RegionalOffice { get; set; }
    public string? Remarks { get; set; }
    public bool IsAlternateIssuer { get; set; }
    public string? OriginalEvaluatorName { get; set; }
}
