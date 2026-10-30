using System;

namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// Printable Issued Document, License, Permit, or Certificate model.
/// Represents the completed statutory authorization issued to a client post-payment.
/// Supports Exam (Admission Slip), Accreditation (Supplier / Dealer / Manufacturer),
/// and Certificate categories (ROC, Amateur, WDN/SRD/RFID, TVRO, Exemption).
/// </summary>
public class IssuedDocumentModel
{
    public string DocumentTitle { get; set; } = "RADIO STATION LICENSE";
    public string DocumentType { get; set; } = "License"; // License | Certificate | Permit | Accreditation | Admission Slip
    public string? TemplateName { get; set; }
    public string FormNumber { get; set; } = string.Empty;
    public string? LicenseNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ServiceCode { get; set; }

    // Licensee / Grantee / Examinee
    public string LicenseeName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? ContactNumber { get; set; }
    public string? FaxNumber { get; set; }
    public string? Email { get; set; }

    // Personal / Examinee Details
    public string? Citizenship { get; set; }
    public string? BirthDate { get; set; }
    public string? Sex { get; set; }
    public string? Height { get; set; }
    public string? Weight { get; set; }

    // Technical / Station / Equipment Specifications
    public string? CallSign { get; set; }
    public string? StationClass { get; set; }
    public string? Category { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceCategory { get; set; }
    public string? FrequencyBand { get; set; }
    public string? EquipmentDetails { get; set; }
    public string? LocationOrServiceArea { get; set; }
    public string? StationLocation { get; set; }

    // Equipment Specifics (for Certificates, Permits, WD/SRD/RFID, etc.)
    public string? MakeTypeModel { get; set; }
    public string? SerialNumber { get; set; }
    public string? Quantity { get; set; }
    public string? OtherEquipment { get; set; }
    public string? AuthorizedEquipment { get; set; }
    public string? NumberOfUnits { get; set; }
    public string? FrequencyRange { get; set; }
    public string? PowerOutput { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? PermitNumber { get; set; }
    public string? BSDNumber { get; set; }

    // TVRO Specifics
    public string? Diameter { get; set; }
    public string? Polarization { get; set; }
    public string? AzimuthAndAngleOfElevation { get; set; }
    public string? TypeModelDish { get; set; }
    public string? LNALNBMakeTypeModel { get; set; }
    public string? LNALNBRange { get; set; }
    public string? LNALNBSerialNumber { get; set; }

    // Examination Specifics
    public string? Exam { get; set; }
    public string? ExamVenue { get; set; }
    public string? ExamDate { get; set; }
    public string? ExamTime { get; set; }
    public string? ExamElements { get; set; }
    public string? ExamRating { get; set; }
    public string? Others { get; set; }

    // Validity & Financial Cross-Reference
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }
    public string? ValidityPeriod { get; set; }
    public string? OfficialReceiptNumber { get; set; }
    public decimal? AmountPaid { get; set; }
    public string? OrDate { get; set; }
    public string? OrBy { get; set; }
    public string? OrAmount { get; set; }

    // Integrity & Signatories
    public string? QrVerificationCode { get; set; }
    public string SignatoryName { get; set; } = "REGIONAL DIRECTOR";
    public string SignatoryTitle { get; set; } = "Regional Director / Authorized Signatory";
    public string? CommissionerName { get; set; }
    public string? EvaluatorName { get; set; }
    public string? EvaluatorLabel { get; set; }
    public string OfficeName { get; set; } = "NATIONAL TELECOMMUNICATIONS COMMISSION";
    public string? RegionalOffice { get; set; }
    public string? Remarks { get; set; }
    public string? Notes { get; set; }
    public string? ProcessByEvaluation { get; set; }
    public bool IsAlternateIssuer { get; set; }
    public string? OriginalEvaluatorName { get; set; }

    // Applicant ID Photo (1" x 1")
    public string? ApplicantPhotoUrl { get; set; }
    public byte[]? ApplicantPhotoBytes { get; set; }
}
