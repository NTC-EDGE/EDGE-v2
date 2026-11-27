using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps database IssuedDocumentDetail and Application entities
/// to a printable IssuedDocumentModel matching statutory NTC standards
/// across Exam, Accreditation, and Certificate categories.
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

        // 1. Resolve Service, Variant, and Category
        var appApplicants = app?.ApplicationApplicants ?? Enumerable.Empty<ApplicationApplicant>();
        var primaryService = appApplicants.Select(aa => aa?.Applicant?.Service).FirstOrDefault(s => s != null);
        var primaryVariant = appApplicants.Select(aa => aa?.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var serviceName = primaryService?.Name ?? "Statutory Application";
        var serviceCode = primaryService?.Code ?? string.Empty;
        var categoryName = primaryService?.ServiceCategory?.Name ?? primaryService?.Group ?? string.Empty;

        model.ServiceName = serviceName;
        model.ServiceCode = serviceCode;
        model.ServiceCategory = !string.IsNullOrWhiteSpace(categoryName) ? categoryName : "Telecommunications";

        // 2. Resolve Applicant / Licensee / Examinee (scoped to doc.ApplicantId for bulk applications)
        var isBulkApp = app != null && (app.SubmissionMode == Domain.Enums.SubmissionMode.Bulk || (app.ApplicationApplicants?.Count ?? 0) > 1);
        var applicant = doc.Applicant
            ?? (doc.ApplicantId.HasValue
                ? app?.ApplicationApplicants?.FirstOrDefault(aa => aa.ApplicantId == doc.ApplicantId.Value)?.Applicant
                : null)
            ?? app?.ApplicationApplicants?.OrderBy(aa => aa.SequenceOrder).Select(aa => aa.Applicant).FirstOrDefault();

        var applicantFieldValues = (app?.FormSubmissions ?? Enumerable.Empty<FormSubmission>())
            .Where(fs => applicant != null && fs.ApplicantId == applicant.Id)
            .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>())
            .ToList();

        if (applicantFieldValues.Count == 0 && !isBulkApp)
        {
            applicantFieldValues = app?.FormSubmissions?.SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>()).ToList() ?? new List<FormFieldValue>();
        }

        var applicantPerson = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? (!isBulkApp ? app?.User?.CompanyDetail : null);

        var repNameFromFields = FindField(applicantFieldValues, "authorized representative name", "representative name")?.Value?.Trim();
        var filingUserFullName = app?.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : null;

        var personNameFromDetail = applicantPerson != null
            ? string.Join(" ", new[] { applicantPerson.FirstName, applicantPerson.MiddleName, applicantPerson.LastName, applicantPerson.Suffix }
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s!.Trim())).Trim()
            : null;

        var firstNameFromFields = FindField(applicantFieldValues, "first name", "given name")?.Value?.Trim();
        var middleNameFromFields = FindField(applicantFieldValues, "middle name")?.Value?.Trim();
        var lastNameFromFields = FindField(applicantFieldValues, "last name", "surname", "family name")?.Value?.Trim();
        var suffixFromFields = FindField(applicantFieldValues, "suffix", "extension")?.Value?.Trim();
        var personNameFromFields = string.Join(" ", new[] { firstNameFromFields, middleNameFromFields, lastNameFromFields, suffixFromFields }
            .Where(s => !string.IsNullOrWhiteSpace(s))).Trim();

        var fullLegalNameFromFields = FindField(applicantFieldValues, "full legal name", "full name", "applicant name", "name of applicant")?.Value?.Trim();
        var companyNameFromFields = FindField(applicantFieldValues, "company / business name", "company name", "business name", "corporate name")?.Value?.Trim();

        var resolvedCompanyName = !string.IsNullOrWhiteSpace(applicant?.CompanyDetail?.Name)
            ? applicant.CompanyDetail.Name.Trim()
            : (!string.IsNullOrWhiteSpace(companyNameFromFields)
                ? companyNameFromFields
                : (!isBulkApp ? company?.Name : null));

        bool isPersonDetailRepresentative = !string.IsNullOrWhiteSpace(personNameFromDetail) &&
            ((!string.IsNullOrWhiteSpace(repNameFromFields) && string.Equals(personNameFromDetail, repNameFromFields, StringComparison.OrdinalIgnoreCase)) ||
             (isBulkApp && !string.IsNullOrWhiteSpace(filingUserFullName) && string.Equals(personNameFromDetail, filingUserFullName, StringComparison.OrdinalIgnoreCase) &&
              (!string.IsNullOrWhiteSpace(personNameFromFields) || !string.IsNullOrWhiteSpace(fullLegalNameFromFields) || !string.IsNullOrWhiteSpace(resolvedCompanyName))));

        var isCompanyApplicant = applicant?.ApplicantType == Domain.Enums.ApplicantType.Company;

        string? resolvedApplicantName;
        if (isCompanyApplicant && !string.IsNullOrWhiteSpace(resolvedCompanyName) && (isPersonDetailRepresentative || string.IsNullOrWhiteSpace(personNameFromDetail)))
        {
            resolvedApplicantName = resolvedCompanyName;
        }
        else if (!string.IsNullOrWhiteSpace(personNameFromDetail) && !isPersonDetailRepresentative)
        {
            resolvedApplicantName = personNameFromDetail;
        }
        else if (!string.IsNullOrWhiteSpace(personNameFromFields))
        {
            resolvedApplicantName = personNameFromFields;
        }
        else if (!string.IsNullOrWhiteSpace(fullLegalNameFromFields))
        {
            resolvedApplicantName = fullLegalNameFromFields;
        }
        else if (!string.IsNullOrWhiteSpace(resolvedCompanyName))
        {
            resolvedApplicantName = resolvedCompanyName;
        }
        else if (!string.IsNullOrWhiteSpace(personNameFromDetail))
        {
            resolvedApplicantName = personNameFromDetail;
        }
        else
        {
            resolvedApplicantName = !isBulkApp && !string.IsNullOrWhiteSpace(filingUserFullName) ? filingUserFullName : "Grantee";
        }

        var addressFromFields = FindField(applicantFieldValues, "complete address", "street address", "address")?.Value?.Trim();

        model.LicenseeName = resolvedApplicantName;
        model.CompanyName = isCompanyApplicant ? resolvedCompanyName : null;
        model.Address = (!string.IsNullOrWhiteSpace(applicantPerson?.Address) ? applicantPerson.Address : null)
            ?? (!string.IsNullOrWhiteSpace(addressFromFields) ? addressFromFields : null)
            ?? (!string.IsNullOrWhiteSpace(applicant?.CompanyDetail?.Address) ? applicant.CompanyDetail.Address : null)
            ?? (!isBulkApp ? company?.Address : null)
            ?? "Address on Record";

        model.ContactNumber = (!string.IsNullOrWhiteSpace(applicantPerson?.ContactNumber) ? applicantPerson.ContactNumber : null)
            ?? FindField(applicantFieldValues, "contact / mobile number", "contact number", "mobile number")?.Value?.Trim()
            ?? company?.ContactNumber;
        model.Email = (!string.IsNullOrWhiteSpace(applicantPerson?.EmailAddress) ? applicantPerson.EmailAddress : null)
            ?? FindField(applicantFieldValues, "email address", "email")?.Value?.Trim()
            ?? company?.Email
            ?? (!isBulkApp ? app?.User?.Email : null);

        // Personal specifics (ROC, Exam, Amateur)
        if (applicantPerson != null)
        {
            model.Citizenship = !string.IsNullOrWhiteSpace(applicantPerson.Nationality) ? applicantPerson.Nationality : "Filipino";
            model.BirthDate = applicantPerson.BirthDate != default ? applicantPerson.BirthDate.ToString("MM/dd/yyyy") : null;
            model.Sex = applicantPerson.Sex;
            model.Height = applicantPerson.Height.HasValue ? $"{applicantPerson.Height.Value} cm" : null;
            model.Weight = applicantPerson.Weight.HasValue ? $"{applicantPerson.Weight.Value} kg" : null;
        }
        else
        {
            model.Citizenship = "Filipino";
        }

        // 3. Technical, Station & Call Sign Specifications
        model.CallSign = doc.CallSign;
        model.StationClass = doc.StationClass ?? "Commercial Station";
        model.FrequencyBand = doc.FrequencyBand ?? "Assigned Bandwidth & Frequency Allocation";

        var allFieldValues = applicantFieldValues.Count > 0
            ? applicantFieldValues
            : (app?.FormSubmissions?
                .Where(fs => fs != null)
                .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>())
                .ToList() ?? new List<FormFieldValue>());

        // Extract Equipment & Device Details (including Repeater Rows)
        ExtractEquipmentDetails(allFieldValues, model);

        var locationField = FindField(allFieldValues, "location", "station address", "stationlocation", "venue");
        model.LocationOrServiceArea = locationField?.Value ?? model.Address;
        model.StationLocation = model.LocationOrServiceArea;

        // 4. Validity & Financial Cross-Reference
        model.IssueDate = doc.IssueDate != default ? doc.IssueDate : (app?.LastModifiedAt ?? DateTime.UtcNow);
        model.ExpiryDate = doc.ExpiryDate ?? (model.IssueDate.AddYears(3));
        model.ValidityPeriod = model.ExpiryDate.HasValue ? $"VALID UNTIL {model.ExpiryDate.Value:MMMM dd, yyyy}".ToUpperInvariant() : "THREE (3) YEARS";

        var paidOp = app?.OrdersOfPayment?.FirstOrDefault(o => o.Status == Domain.Enums.OpStatus.Paid)
            ?? app?.OrdersOfPayment?.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

        model.OfficialReceiptNumber = doc.OfficialReceiptNumber
            ?? paidOp?.OfficialReceiptNumber;
        model.AmountPaid = paidOp?.AmountDue;
        model.OrAmount = paidOp != null && paidOp.AmountDue > 0 ? paidOp.AmountDue.ToString("N2") : string.Empty;
        model.OrDate = paidOp?.PaidAt?.ToString("MM/dd/yyyy") ?? model.IssueDate.ToString("MM/dd/yyyy");
        var regionalOfficeLabel = !string.IsNullOrWhiteSpace(app?.Office)
            ? app.Office
            : (!string.IsNullOrWhiteSpace(app?.Region?.Name) ? $"NTC {app.Region.Name}" : null);

        model.OrBy = !string.IsNullOrWhiteSpace(regionalOfficeLabel)
            ? $"Special Collecting Officer, {regionalOfficeLabel}"
            : "Special Collecting Officer";

        // 5. Regional & Signatories
        model.QrVerificationCode = doc.QrVerificationCode ?? $"NTC-VERIFY-{doc.Id.ToString("N")[..12].ToUpperInvariant()}";
        model.OfficeName = "NATIONAL TELECOMMUNICATIONS COMMISSION";
        model.RegionalOffice = !string.IsNullOrWhiteSpace(app?.Office)
            ? app.Office
            : (!string.IsNullOrWhiteSpace(app?.Tenant?.Name)
                ? app.Tenant.Name
                : (app?.Region?.Name ?? string.Empty));

        model.SignatoryName = !string.IsNullOrWhiteSpace(doc.IssuedByStaffName)
            ? doc.IssuedByStaffName
            : "REGIONAL DIRECTOR";
        model.SignatoryTitle = "Regional Director / Authorized Signatory";
        model.OriginalEvaluatorName = doc.OriginalEvaluatorName;
        model.EvaluatorName = doc.OriginalEvaluatorName ?? "Licensing Officer";
        model.Remarks = doc.Remarks;
        model.IsAlternateIssuer = doc.IsAlternateIssuer;

        // 6. Template & Category Resolution (Exam, Accreditation, Certificates)
        var variantDesc = primaryVariant?.Description ?? primaryVariant?.Type.ToString();
        ResolveCategoryAndTemplate(model, serviceCode, serviceName, categoryName, variantDesc, allFieldValues);

        var allAppRequirements = (app?.ApplicationRequirements ?? Enumerable.Empty<ApplicationRequirement>()).ToList();
        var candidateRequirements = allAppRequirements
            .Where(r => applicant != null && r.ApplicantId == applicant.Id)
            .ToList();

        if (candidateRequirements.Count == 0 && !isBulkApp)
        {
            candidateRequirements = allAppRequirements;
        }

        var photoReq = candidateRequirements.FirstOrDefault(r => HasUploadedFile(r) && IsPhotoRequirement(r))
            ?? (!isBulkApp ? allAppRequirements.FirstOrDefault(r => HasUploadedFile(r) && IsPhotoRequirement(r)) : null)
            ?? candidateRequirements.LastOrDefault(r => HasUploadedFile(r) && IsImageAttachment(r))
            ?? (!isBulkApp ? allAppRequirements.LastOrDefault(r => HasUploadedFile(r) && IsImageAttachment(r)) : null)
            ?? candidateRequirements.FirstOrDefault(IsPhotoRequirement);

        if (photoReq != null)
        {
            model.ApplicantPhotoUrl = !string.IsNullOrWhiteSpace(photoReq.Url) ? photoReq.Url : null;
            model.ApplicantPhotoStoredFileId = photoReq.StoredFileId ?? photoReq.StoredFile?.Id ?? TryParseStoredFileIdFromUrl(photoReq.Url);
            model.ApplicantPhotoBytes = TryDecodeBase64DataUrl(photoReq.Url);
        }

        if (model.ApplicantPhotoStoredFileId == null && (model.ApplicantPhotoBytes == null || model.ApplicantPhotoBytes.Length == 0))
        {
            var photoFieldVal = FindField(allFieldValues, "1x1", "2x2", "photo", "picture", "id pic")?.Value?.Trim();
            if (!string.IsNullOrWhiteSpace(photoFieldVal))
            {
                model.ApplicantPhotoUrl ??= photoFieldVal;
                model.ApplicantPhotoStoredFileId = TryParseStoredFileIdFromUrl(photoFieldVal);
                model.ApplicantPhotoBytes = TryDecodeBase64DataUrl(photoFieldVal);
            }
        }

        return model;
    }

    private static bool HasUploadedFile(ApplicationRequirement r)
    {
        return (r.StoredFileId.HasValue && r.StoredFileId.Value != Guid.Empty) ||
               r.StoredFile != null ||
               !string.IsNullOrWhiteSpace(r.Url);
    }

    private static bool IsImageAttachment(ApplicationRequirement r)
    {
        var contentType = r.StoredFile?.ContentType ?? string.Empty;
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var fileName = (r.StoredFile?.FileName ?? r.Url ?? string.Empty).ToLowerInvariant();
        return fileName.EndsWith(".jpg", StringComparison.Ordinal) ||
               fileName.EndsWith(".jpeg", StringComparison.Ordinal) ||
               fileName.EndsWith(".png", StringComparison.Ordinal) ||
               fileName.EndsWith(".webp", StringComparison.Ordinal) ||
               fileName.EndsWith(".bmp", StringComparison.Ordinal) ||
               fileName.EndsWith(".gif", StringComparison.Ordinal);
    }

    private static bool IsPhotoRequirement(ApplicationRequirement r)
    {
        if (r.RequirementId == Guid.Parse("70000000-0000-0000-0000-000000000503") || // Exam 1x1 ID Picture
            r.RequirementId == Guid.Parse("70000000-0000-0000-0000-000000000003") || // Certificates/Licenses/Permits 1x1 ID Picture
            r.RequirementId == Guid.Parse("70000000-0000-0000-0000-000000000033"))
        {
            return true;
        }

        var reqName = r.Requirement?.Name ?? string.Empty;
        var fileName = r.StoredFile?.FileName ?? string.Empty;

        return reqName.Contains("1x1", StringComparison.OrdinalIgnoreCase) ||
               reqName.Contains("2x2", StringComparison.OrdinalIgnoreCase) ||
               reqName.Contains("photo", StringComparison.OrdinalIgnoreCase) ||
               reqName.Contains("picture", StringComparison.OrdinalIgnoreCase) ||
               reqName.Contains("id pic", StringComparison.OrdinalIgnoreCase) ||
               fileName.Contains("1x1", StringComparison.OrdinalIgnoreCase) ||
               fileName.Contains("photo", StringComparison.OrdinalIgnoreCase) ||
               fileName.Contains("picture", StringComparison.OrdinalIgnoreCase);
    }

    private static Guid? TryParseStoredFileIdFromUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        var trimmed = url.Trim();
        if (Guid.TryParse(trimmed, out var directGuid) && directGuid != Guid.Empty)
        {
            return directGuid;
        }

        const string marker = "/storage/files/";
        var idx = trimmed.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (idx >= 0)
        {
            var segment = trimmed[(idx + marker.Length)..].Split('?', '#', '/')[0];
            if (Guid.TryParse(segment, out var parsedGuid) && parsedGuid != Guid.Empty)
            {
                return parsedGuid;
            }
        }

        return null;
    }

    private static byte[]? TryDecodeBase64DataUrl(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var trimmed = value.Trim();
        const string base64Marker = ";base64,";
        var idx = trimmed.IndexOf(base64Marker, StringComparison.OrdinalIgnoreCase);
        if (idx >= 0)
        {
            var b64 = trimmed[(idx + base64Marker.Length)..].Trim();
            try
            {
                return Convert.FromBase64String(b64);
            }
            catch
            {
                return null;
            }
        }
        return null;
    }

    private static void ResolveCategoryAndTemplate(
        IssuedDocumentModel model,
        string serviceCode,
        string serviceName,
        string categoryName,
        string? variantName,
        List<FormFieldValue> fieldValues)
    {
        var sName = serviceName.ToUpperInvariant();
        var cName = categoryName.ToUpperInvariant();
        var sCode = serviceCode.ToUpperInvariant();
        var vName = (variantName ?? string.Empty).ToUpperInvariant();

        // ----------------------------------------------------
        // A. EXAM CATEGORY (Service-1-Admission-Slip.pdf)
        // ----------------------------------------------------
        if (sCode.StartsWith("NTC_1_01") ||
            cName.Contains("EXAM") ||
            sName.Contains("EXAMINATION") ||
            sName.Contains("ADMISSION SLIP") ||
            model.DocumentType.Equals("Admission Slip", StringComparison.OrdinalIgnoreCase))
        {
            model.TemplateName = "Service-1-Admission-Slip.pdf";
            model.DocumentType = "Admission Slip";
            model.DocumentTitle = "EXAMINATION ADMISSION SLIP";

            model.Exam = !string.IsNullOrWhiteSpace(serviceName) ? serviceName.ToUpperInvariant() : "COMMERCIAL RADIO OPERATOR EXAMINATION";
            var venueField = FindField(fieldValues, "venue", "exam venue", "test center");
            model.ExamVenue = venueField?.Value ?? "NTC Examination Center / Regional Office";

            var examDateField = FindField(fieldValues, "exam date", "date of exam", "schedule");
            model.ExamDate = examDateField?.Value ?? model.IssueDate.ToString("MM/dd/yyyy");
            model.ExamTime = "08:00 AM";

            var elementsField = FindField(fieldValues, "elements", "subjects", "exam element");
            model.ExamElements = elementsField?.Value ?? "Elements 1, 2, 3, 4";

return;
        }

        // ----------------------------------------------------
        // B. ACCREDITATION CATEGORY (Service-15-*.pdf)
        // ----------------------------------------------------
        if (sCode.StartsWith("NTC_1_15") ||
            cName.Contains("ACCREDITATION") ||
            sName.Contains("ACCREDITATION") ||
            model.DocumentType.Equals("Accreditation", StringComparison.OrdinalIgnoreCase))
        {
            model.DocumentType = "Accreditation";
            model.DocumentTitle = "CERTIFICATE OF ACCREDITATION";

            // Discriminate variants: CPE, Mobile Phone, RCE, or Supplier
            if (sName.Contains("CPE") || vName.Contains("CPE"))
            {
                if (sName.Contains("MANUFACTURER") || vName.Contains("MANUFACTURER"))
                    model.TemplateName = "Service-15-CPE-Manufacturer-Permit.pdf";
                else if (sName.Contains("SERVICE CENTER") || vName.Contains("SERVICE CENTER"))
                    model.TemplateName = "Service-15-CPE-Service-Center-Permit.pdf";
                else
                    model.TemplateName = "Service-15-CPE-Dealers-Permit.pdf";
            }
            else if (sName.Contains("MOBILE PHONE") || vName.Contains("MOBILE PHONE") || sName.Contains("CELLULAR"))
            {
                if (sName.Contains("RETAILER") || vName.Contains("RETAILER"))
                    model.TemplateName = "Service-15-Mobile-Phone-Retailer-Permit.pdf";
                else if (sName.Contains("SERVICE CENTER") || vName.Contains("SERVICE CENTER"))
                    model.TemplateName = "Service-15-Mobile-Phone-Service-Center-Permit.pdf";
                else
                    model.TemplateName = "Service-15-Mobile-Phone-Dealers-Permit.pdf";
            }
            else if (sName.Contains("RCE") || vName.Contains("RCE"))
            {
                if (sName.Contains("MANUFACTURER") || vName.Contains("MANUFACTURER"))
                    model.TemplateName = "Service-15-RCE-Manufacturer-Permit.pdf";
                else if (sName.Contains("SERVICE CENTER") || vName.Contains("SERVICE CENTER"))
                    model.TemplateName = "Service-15-RCE-Service-Center-Permit.pdf";
                else
                    model.TemplateName = "Service-15-RCE-Dealers-Permit.pdf";
            }
            else
            {
                model.TemplateName = "Service-15-Supplier-Accreditation.pdf";
            }
            return;
        }

        // ----------------------------------------------------
        // C. CERTIFICATES CATEGORY (Service-2, 3, 16, 17/18/19, 20)
        // ----------------------------------------------------
        // 1. Radio Operator Certificates (Service-2-*.pdf)
        if (sCode.StartsWith("NTC_1_02") || sName.Contains("RADIO OPERATOR") || sName.Contains("ROC"))
        {
            model.DocumentType = "Certificate";
            model.DocumentTitle = "RADIO OPERATOR CERTIFICATE";

            if (sName.Contains("GROC"))
                model.TemplateName = "Service-2-GROC.pdf";
            else if (sName.Contains("RLM"))
                model.TemplateName = "Service-2-RLM.pdf";
            else if (sName.Contains("AIRCRAFT") || sName.Contains("RROC"))
                model.TemplateName = "Service-2-RROC-Aircraft.pdf";
            else if (sName.Contains("SROP-FB") || sName.Contains("FIXED BASE"))
                model.TemplateName = "Service-2-SROP-FB.pdf";
            else if (sName.Contains("SROP"))
                model.TemplateName = "Service-2-SROP.pdf";
            else if (sName.Contains("TEMPORARY"))
                model.TemplateName = "Service-2-Temporary-ROC.pdf";
            else
                model.TemplateName = "Service-2-ROC.pdf";

            model.Exam = sName;
            return;
        }

        // 2. Amateur Licenses & Permits (Service-3-*.pdf)
        if (sCode.StartsWith("NTC_1_03") || sName.Contains("AMATEUR"))
        {
            model.DocumentType = "License";
            model.DocumentTitle = "AMATEUR RADIO STATION LICENSE";

            if (sName.Contains("LIFETIME") || vName.Contains("LIFETIME"))
                model.TemplateName = "Service-3-AT-LIFETIME.pdf";
            else if (sName.Contains("CLUB") || vName.Contains("CLUB"))
                model.TemplateName = "Service-3-AT-CLUB-RSL.pdf";
            else if (sName.Contains("RSL"))
                model.TemplateName = "Service-3-AT-RSL.pdf";
            else
                model.TemplateName = "Service-3-Amateur-License.pdf";
            return;
        }

        // 3. WDN / SRD / RFID Certificates of Registration (Service-16-*.pdf)
        if (sCode.StartsWith("NTC_1_16") || sCode.StartsWith("NTC_1_19") ||
            sName.Contains("WDN") || sName.Contains("SRD") || sName.Contains("RFID"))
        {
            model.DocumentType = "Certificate";
            model.DocumentTitle = "CERTIFICATE OF REGISTRATION";

            bool isDealer = sName.Contains("DEALER") || vName.Contains("DEALER");

            if (sName.Contains("RFID"))
                model.TemplateName = isDealer ? "Service-16-Certificate-of-Registration-RFID - Dealer.pdf" : "Service-16-Certificate-of-Registration-RFID.pdf";
            else if (sName.Contains("SRD"))
                model.TemplateName = isDealer ? "Service-16-Certificate-of-Registration-SRD-Dealer.pdf" : "Service-16-Certificate-of-Registration-SRD.pdf";
            else
                model.TemplateName = isDealer ? "Service-16-Certificate-of-Registration-WDN-Dealer.pdf" : "Service-16-Certificate-of-Registration-WDN.pdf";
            return;
        }

        // 4. TVRO Certificates of Registration (Service-17, 18, 19)
        if (sName.Contains("TVRO") || sCode.StartsWith("NTC_1_17") || sCode.StartsWith("NTC_1_18"))
        {
            model.DocumentType = "Certificate";
            model.DocumentTitle = "TVRO CERTIFICATE OF REGISTRATION";

            if (sName.Contains("18") || sCode.StartsWith("NTC_1_18"))
                model.TemplateName = "Service-18-TVRO-Certificate-of-Registration.pdf";
            else if (sName.Contains("19"))
                model.TemplateName = "Service-19-TVRO-Certificate-of-Registration.pdf";
            else
                model.TemplateName = "Service-17-TVRO-Certificate-of-Registration.pdf";
            return;
        }

        // 5. Certificate of Exemption (Service-20)
        if (sCode.StartsWith("NTC_1_20") || sName.Contains("EXEMPTION"))
        {
            model.DocumentType = "Certificate";
            model.DocumentTitle = "CERTIFICATE OF EXEMPTION";
            model.TemplateName = "Service-20-Certificate-Of-Exemption.pdf";
            return;
        }

        // 6. Aeronautical / Aircraft Station License (Service-4)
        if (sCode.StartsWith("NTC_1_04") || sName.Contains("AIRCRAFT") || sName.Contains("AERONAUTICAL") || sName.Contains("ASL"))
        {
            if (sName.Contains("PURCHASE") || vName.Contains("PURCHASE"))
                model.TemplateName = "Service-4-Permit-to-Purchase.pdf";
            else if (sName.Contains("POSSESS") || vName.Contains("POSSESS"))
                model.TemplateName = "Service-4-Permit-to-Possess.pdf";
            else if (sName.Contains("FASL") || sName.Contains("FIXED"))
                model.TemplateName = "Service-4-FASL.pdf";
            else
                model.TemplateName = "Service-4-ASL.pdf";
            return;
        }

        // 7. Maritime / Ship Station License (Service-5)
        if (sCode.StartsWith("NTC_1_05") || sName.Contains("SHIP") || sName.Contains("VESSEL"))
        {
            if (sName.Contains("PURCHASE") || vName.Contains("PURCHASE"))
                model.TemplateName = "Service-5-Permit-to-Purchase.pdf";
            else if (sName.Contains("POSSESS") || vName.Contains("POSSESS"))
                model.TemplateName = "Service-5-Permit-to-Possess.pdf";
            else
                model.TemplateName = "Service-5-Ship-Station-License.pdf";
            return;
        }

        // 8. Coastal Station License (Service-6)
        if (sCode.StartsWith("NTC_1_06") || sName.Contains("COASTAL"))
        {
            if (sName.Contains("PRIVATE"))
                model.TemplateName = "Service-6-Private-Coastal-Station-License.pdf";
            else
                model.TemplateName = "Service-6-Public-Coastal-Station-License.pdf";
            return;
        }

        // 9. Cellular / Network / BTS Radio Station License (Service-8)
        if (sCode.StartsWith("NTC_1_08") || sName.Contains("BTS") || sName.Contains("CELLULAR") || sName.Contains("BASE TRANSCEIVER"))
        {
            if (sName.Contains("BTS"))
                model.TemplateName = "Service-8-Radio-Station-License-BTS.pdf";
            else if (sName.Contains("NETWORK"))
                model.TemplateName = "Service-8-Network-Radio-Station-License.pdf";
            else
                model.TemplateName = "Service-8-Radio-Station-License.pdf";
            return;
        }

        // 10. Commercial / Private Radio Station License & Permits (Service-9)
        if (sCode.StartsWith("NTC_1_09") || sName.Contains("RADIO STATION LICENSE") || sName.Contains("COMMERCIAL RADIO") || cName.Contains("LICENSE"))
        {
            if (sName.Contains("DEALER") || vName.Contains("DEALER"))
                model.TemplateName = "Service-9-Dealers-Permit.pdf";
            else if (sName.Contains("PURCHASE") || vName.Contains("PURCHASE"))
                model.TemplateName = "Service-9-Permit-to-Purchase.pdf";
            else if (sName.Contains("POSSESS") || vName.Contains("POSSESS"))
                model.TemplateName = "Service-9-Permit-to-Possess.pdf";
            else if (sName.Contains("TRANSPORT") || vName.Contains("TRANSPORT"))
                model.TemplateName = "Service-9-Permit-To-Transport.pdf";
            else
                model.TemplateName = "Service-9-Radio-Station-License.pdf";
            return;
        }

        // 11. Construction Permit & License (Service-10)
        if (sCode.StartsWith("NTC_1_10") || sName.Contains("CONSTRUCTION PERMIT"))
        {
            model.TemplateName = "Service-10-Construction-Permit-And-License.pdf";
            return;
        }

        // 12. Temporary Permit to Demonstrate (Service-13)
        if (sCode.StartsWith("NTC_1_13") || sName.Contains("DEMONSTRATE"))
        {
            model.TemplateName = "Service-13-Temporary-Permit-to-Demonstrate.pdf";
            return;
        }

        // 13. Permit to Transport (Service-14)
        if (sCode.StartsWith("NTC_1_14") || sName.Contains("TRANSPORT"))
        {
            model.TemplateName = "Service-14-Permit-To-Transport.pdf";
            return;
        }

        // Default Title based on DocumentType
        if (model.DocumentType.Equals("Certificate", StringComparison.OrdinalIgnoreCase))
            model.DocumentTitle = $"CERTIFICATE OF {sName}";
        else if (model.DocumentType.Equals("Permit", StringComparison.OrdinalIgnoreCase))
            model.DocumentTitle = $"PERMIT TO {sName}";
        else
            model.DocumentTitle = $"{sName} LICENSE";
    }

    private static void ExtractEquipmentDetails(List<FormFieldValue> fieldValues, IssuedDocumentModel model)
    {
        var makes = new List<string>();
        var models = new List<string>();
        var serials = new List<string>();
        int totalUnits = 0;

        foreach (var f in fieldValues)
        {
            if (string.IsNullOrWhiteSpace(f.Value)) continue;

            // Check if this field contains a JSON array of repeater rows (e.g. Registered Devices repeater)
            var trimmed = f.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in doc.RootElement.EnumerateArray())
                        {
                            totalUnits++;
                            if (item.TryGetProperty("make", out var m) || item.TryGetProperty("makeTypeModel", out m) || item.TryGetProperty("makeType", out m))
                                makes.Add(m.GetString() ?? string.Empty);
                            if (item.TryGetProperty("model", out var mdl))
                                models.Add(mdl.GetString() ?? string.Empty);
                            if (item.TryGetProperty("serialNumber", out var sn) || item.TryGetProperty("equipmentSerial", out sn) || item.TryGetProperty("serial", out sn))
                                serials.Add(sn.GetString() ?? string.Empty);
                        }
                    }
                }
                catch
                {
                    // Ignore JSON parse errors, proceed with plain fields
                }
            }
            else
            {
                var label = (f.CustomLabel ?? f.Field?.Label ?? string.Empty).ToLowerInvariant();
                if (label.Contains("make") && !label.Contains("serial"))
                    makes.Add(f.Value);
                else if (label.Contains("model") && !label.Contains("serial"))
                    models.Add(f.Value);
                else if (label.Contains("serial") || label.Contains("equipment serial") || label.Contains("serial number"))
                    serials.Add(f.Value);
            }
        }

        var distinctMakes = makes.Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList();
        var distinctModels = models.Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList();
        var distinctSerials = serials.Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList();

        if (distinctMakes.Count > 0 || distinctModels.Count > 0)
        {
            var combinedMakeModel = string.Join(" / ", distinctMakes.Concat(distinctModels).Distinct());
            model.MakeTypeModel = combinedMakeModel;
            model.EquipmentDetails = combinedMakeModel;
        }

        if (distinctSerials.Count > 0)
        {
            model.SerialNumber = string.Join(", ", distinctSerials);
        }

        if (totalUnits > 0)
        {
            model.Quantity = totalUnits.ToString();
            model.NumberOfUnits = totalUnits.ToString();
        }
    }

    private static FormFieldValue? FindField(List<FormFieldValue> fieldValues, params string[] keywords)
    {
        return fieldValues.FirstOrDefault(f =>
            !string.IsNullOrWhiteSpace(f.Value) &&
            keywords.Any(k =>
                (f.CustomLabel != null && f.CustomLabel.Contains(k, StringComparison.OrdinalIgnoreCase)) ||
                (f.Field?.Label != null && f.Field.Label.Contains(k, StringComparison.OrdinalIgnoreCase))));
    }
}
