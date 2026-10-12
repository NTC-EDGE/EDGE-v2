using System;
using System.Linq;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps database IssuedDocumentDetail and Application entities
/// to a printable IssuedDocumentModel matching statutory NTC permit and license standards.
/// </summary>
public static class IssuedDocumentPrintMapper
{
    public static IssuedDocumentModel MapToPrintModel(
        IssuedDocumentDetail doc,
        EDGE.Domain.Entities.Application? app = null)
    {
        var model = new IssuedDocumentModel();

        model.DocumentType = !string.IsNullOrWhiteSpace(doc.DocumentType) ? doc.DocumentType : "License";
        model.FormNumber = doc.FormNumber;
        model.LicenseNumber = doc.LicenseNumber ?? doc.FormNumber;
        model.ReferenceNumber = app?.ReferenceNumber ?? doc.FormNumber;
        model.ApplicationNumber = app?.ApplicationNumber ?? app?.ReferenceNumber;

        // 1. Resolve Service / Document Title
        var primaryService = app?.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var primaryVariant = app?.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var serviceName = primaryService?.Name ?? "Statutory Application";

        model.ServiceName = serviceName;
        model.ServiceCategory = primaryService?.ServiceCategory?.Name ?? primaryService?.Group ?? "Telecommunications";

        if (model.DocumentType.Equals("Certificate", StringComparison.OrdinalIgnoreCase))
        {
            model.DocumentTitle = !string.IsNullOrWhiteSpace(serviceName) && serviceName.Contains("Certificate", StringComparison.OrdinalIgnoreCase)
                ? serviceName.ToUpperInvariant()
                : $"CERTIFICATE OF {serviceName.ToUpperInvariant()}";
        }
        else if (model.DocumentType.Equals("Permit", StringComparison.OrdinalIgnoreCase))
        {
            model.DocumentTitle = !string.IsNullOrWhiteSpace(serviceName) && serviceName.Contains("Permit", StringComparison.OrdinalIgnoreCase)
                ? serviceName.ToUpperInvariant()
                : $"PERMIT TO {serviceName.ToUpperInvariant()}";
        }
        else
        {
            model.DocumentTitle = !string.IsNullOrWhiteSpace(serviceName) && serviceName.Contains("License", StringComparison.OrdinalIgnoreCase)
                ? serviceName.ToUpperInvariant()
                : $"{serviceName.ToUpperInvariant()} LICENSE";
        }

        // 2. Resolve Licensee / Grantee
        var fallbackApplicantName = app?.ApplicationApplicants
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a => a?.CompanyDetail?.Name ?? (a?.ApplicantDetail != null ? $"{a.ApplicantDetail.FirstName} {a.ApplicantDetail.LastName}".Trim() : null))
            .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        var fallbackAddress = app?.ApplicationApplicants
            .Select(aa => aa.Applicant)
            .Where(a => a != null)
            .Select(a => a?.CompanyDetail?.Address ?? (a?.ApplicantDetail != null ? a.ApplicantDetail.Address : null))
            .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n));

        var applicant = doc.Applicant;
        var applicantName = applicant?.CompanyDetail?.Name
            ?? (applicant?.ApplicantDetail != null ? $"{applicant.ApplicantDetail.FirstName} {applicant.ApplicantDetail.LastName}".Trim() : null)
            ?? fallbackApplicantName
            ?? (app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Grantee");

        model.LicenseeName = applicantName;
        model.CompanyName = applicant?.CompanyDetail?.Name ?? app?.User?.CompanyDetail?.Name;
        model.Address = applicant?.CompanyDetail?.Address
            ?? applicant?.ApplicantDetail?.Address
            ?? fallbackAddress
            ?? "Address on Record";

        // 3. Technical & Operational Specifications
        model.CallSign = doc.CallSign;
        model.StationClass = doc.StationClass ?? "Commercial Station";
        model.FrequencyBand = doc.FrequencyBand ?? "Assigned Bandwidth & Frequency Allocation";

        var allFieldValues = app?.FormSubmissions?.SelectMany(fs => fs.FieldValues).ToList();
        var equipField = allFieldValues?.FirstOrDefault(f => !string.IsNullOrWhiteSpace(f.Value) && (f.CustomLabel?.Contains("equipment", StringComparison.OrdinalIgnoreCase) == true || f.CustomLabel?.Contains("transceiver", StringComparison.OrdinalIgnoreCase) == true || f.Field?.Label?.Contains("equipment", StringComparison.OrdinalIgnoreCase) == true || f.Field?.Label?.Contains("transceiver", StringComparison.OrdinalIgnoreCase) == true));
        model.EquipmentDetails = equipField?.Value ?? "Registered and Type-Approved Equipment";

        var locationField = allFieldValues?.FirstOrDefault(f => !string.IsNullOrWhiteSpace(f.Value) && (f.CustomLabel?.Contains("location", StringComparison.OrdinalIgnoreCase) == true || f.CustomLabel?.Contains("station address", StringComparison.OrdinalIgnoreCase) == true || f.Field?.Label?.Contains("location", StringComparison.OrdinalIgnoreCase) == true || f.Field?.Label?.Contains("station address", StringComparison.OrdinalIgnoreCase) == true));
        model.LocationOrServiceArea = locationField?.Value ?? model.Address;

        // 4. Validity & Financials
        model.IssueDate = doc.IssueDate;
        model.ExpiryDate = doc.ExpiryDate;
        model.OfficialReceiptNumber = doc.OfficialReceiptNumber
            ?? app?.OrdersOfPayment?.FirstOrDefault(o => !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber))?.OfficialReceiptNumber;

        var paidOp = app?.OrdersOfPayment?.FirstOrDefault(o => o.Status == Domain.Enums.OpStatus.Paid);
        model.AmountPaid = paidOp?.AmountDue;

        // 5. Security QR & Signatories
        model.QrVerificationCode = doc.QrVerificationCode ?? $"NTC-VERIFY-{doc.Id.ToString("N")[..12].ToUpperInvariant()}";
        model.OfficeName = "NATIONAL TELECOMMUNICATIONS COMMISSION";
        model.RegionalOffice = !string.IsNullOrWhiteSpace(app?.Office) ? app.Office : "National Capital Region";

        model.SignatoryName = !string.IsNullOrWhiteSpace(doc.IssuedByStaffName)
            ? doc.IssuedByStaffName
            : "REGIONAL DIRECTOR";
        model.SignatoryTitle = "Regional Director / Authorized Signatory";
        model.Remarks = doc.Remarks;
        model.IsAlternateIssuer = doc.IsAlternateIssuer;
        model.OriginalEvaluatorName = doc.OriginalEvaluatorName;

        return model;
    }
}
