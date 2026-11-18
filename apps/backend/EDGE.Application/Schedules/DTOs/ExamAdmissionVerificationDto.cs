using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Schedules.DTOs;

public record ExamAdmissionVerificationDto
{
    public Guid IssuedDocumentId { get; init; }
    public Guid ApplicationId { get; init; }
    public Guid? ApplicantId { get; init; }
    public Guid? ScheduleId { get; init; }
    public Guid TenantId { get; init; }
    public string QrVerificationCode { get; init; } = string.Empty;
    public string FormNumber { get; init; } = string.Empty;
    public string? LicenseNumber { get; init; }
    public string ReferenceNumber { get; init; } = string.Empty;
    public string? ApplicationNumber { get; init; }
    public string ExamineeName { get; init; } = string.Empty;
    public string? Sex { get; init; }
    public string? BirthDate { get; init; }
    public string? Nationality { get; init; }
    public string? Email { get; init; }
    public string? ContactNumber { get; init; }
    public string? Address { get; init; }
    public Guid? PhotoStoredFileId { get; init; }
    public string? PhotoUrl { get; init; }
    public string ExamTitle { get; init; } = string.Empty;
    public string? ExamType { get; init; }
    public string? ExamElements { get; init; }
    public string? ExamVenue { get; init; }
    public string? ExamDate { get; init; }
    public string? ExamTime { get; init; }
    public string? OfficialReceiptNumber { get; init; }
    public string ApplicationStatus { get; init; } = string.Empty;
    public bool IsValidForAdmission { get; init; }
    public string ValidationMessage { get; init; } = string.Empty;
    public bool IsAdmitted { get; init; }
    public DateTime? AdmittedAt { get; init; }
    public string? AdmittedByStaffName { get; init; }
    public string? AdmissionRemarks { get; init; }
}

public static class ExamAdmissionMapper
{
    public static List<ExamAdmissionVerificationDto> MapApplicationToExamineeDtos(Domain.Entities.Application app)
    {
        var results = new List<ExamAdmissionVerificationDto>();
        var orderedApplicants = (app.ApplicationApplicants ?? Enumerable.Empty<ApplicationApplicant>())
            .OrderBy(aa => aa.SequenceOrder)
            .ToList();

        var existingDocs = (app.IssuedDocumentDetails ?? Enumerable.Empty<IssuedDocumentDetail>())
            .Where(d => !d.IsDeleted)
            .OrderByDescending(d => d.IssueDate)
            .ToList();

        if (orderedApplicants.Count == 0)
        {
            var doc = existingDocs.FirstOrDefault();
            results.Add(BuildSingleExamineeDto(app, null, doc, 0, 1));
            return results;
        }

        for (int idx = 0; idx < orderedApplicants.Count; idx++)
        {
            var aa = orderedApplicants[idx];
            var applicant = aa.Applicant;
            var applicantId = aa.ApplicantId;

            var matchedDoc = existingDocs.FirstOrDefault(d => d.ApplicantId == applicantId)
                ?? (idx < existingDocs.Count ? existingDocs[idx] : existingDocs.FirstOrDefault());

            results.Add(BuildSingleExamineeDto(app, applicant, matchedDoc, idx, orderedApplicants.Count));
        }

        return results;
    }

    public static ExamAdmissionVerificationDto BuildSingleExamineeDto(
        Domain.Entities.Application app,
        Applicant? applicant,
        IssuedDocumentDetail? doc,
        int index = 0,
        int totalApplicants = 1)
    {
        var applicantId = applicant?.Id ?? doc?.ApplicantId;
        var docId = doc?.Id ?? applicantId ?? app.Id;
        var deterministicQr = $"NTC-VERIFY-{docId.ToString("N")[..12].ToUpperInvariant()}";
        var qrCode = !string.IsNullOrWhiteSpace(doc?.QrVerificationCode)
            ? doc!.QrVerificationCode!.Trim()
            : deterministicQr;

        var baseForm = !string.IsNullOrWhiteSpace(doc?.FormNumber)
            ? doc!.FormNumber.Trim()
            : (app.ApplicationNumber ?? app.ReferenceNumber ?? app.Id.ToString("N")[..8].ToUpperInvariant());

        var formNumber = totalApplicants > 1 && doc == null
            ? $"{baseForm}-{index + 1:D2}"
            : baseForm;

        var fieldValues = (app.FormSubmissions ?? Enumerable.Empty<FormSubmission>())
            .Where(fs => applicantId == null || fs.ApplicantId == applicantId.Value)
            .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>())
            .ToList();

        if (fieldValues.Count == 0 && totalApplicants <= 1)
        {
            fieldValues = (app.FormSubmissions ?? Enumerable.Empty<FormSubmission>())
                .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>())
                .ToList();
        }

        var detail = applicant?.ApplicantDetail;
        var personName = detail != null
            ? string.Join(" ", new[] { detail.FirstName, detail.MiddleName, detail.LastName, detail.Suffix }
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s!.Trim())).Trim()
            : null;

        if (string.IsNullOrWhiteSpace(personName))
        {
            var fn = FindFieldValue(fieldValues, "first name", "given name");
            var mn = FindFieldValue(fieldValues, "middle name");
            var ln = FindFieldValue(fieldValues, "last name", "surname");
            var combined = string.Join(" ", new[] { fn, mn, ln }.Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
            personName = !string.IsNullOrWhiteSpace(combined)
                ? combined
                : (FindFieldValue(fieldValues, "full legal name", "full name", "applicant name")
                   ?? (app.User != null ? $"{app.User.FirstName} {app.User.LastName}".Trim() : "Examinee"));
        }

        if (string.IsNullOrWhiteSpace(personName))
        {
            personName = "Examinee";
        }

        var service = applicant?.Service ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var variant = applicant?.ServiceVariant ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

        var examTitle = service?.Name ?? "Radio Operator Examination";
        var examType = variant?.Description ?? (variant != null && variant.Type != ServiceVariantType.NA ? variant.Type.ToString() : FindFieldValue(fieldValues, "application type", "examinee type", "type"));
        var examElements = FindFieldValue(fieldValues, "elements", "exam element", "selected exam element", "subjects") ?? "Elements 1, 2, 3, 4";

        var examVenue = !string.IsNullOrWhiteSpace(app.Schedule?.Venue)
            ? app.Schedule!.Venue
            : (FindFieldValue(fieldValues, "venue", "exam venue", "test center") ?? app.Office ?? "NTC Examination Center");

        var examDate = app.Schedule != null && app.Schedule.StartDate != default
            ? app.Schedule.StartDate.ToString("MMM dd, yyyy")
            : (FindFieldValue(fieldValues, "exam date", "date of exam", "schedule") ?? (doc?.IssueDate ?? app.CreatedAt).ToString("MMM dd, yyyy"));

        var examTime = !string.IsNullOrWhiteSpace(app.Schedule?.StartTime)
            ? (!string.IsNullOrWhiteSpace(app.Schedule?.EndTime) ? $"{app.Schedule.StartTime} - {app.Schedule.EndTime}" : app.Schedule!.StartTime)
            : "08:00 AM";

        var paidOp = app.OrdersOfPayment?.FirstOrDefault(o => o.Status == OpStatus.Paid)
            ?? app.OrdersOfPayment?.OrderByDescending(o => o.CreatedAt).FirstOrDefault();
        var orNumber = doc?.OfficialReceiptNumber ?? paidOp?.OfficialReceiptNumber;

        // Resolve photo requirement
        var requirements = (app.ApplicationRequirements ?? Enumerable.Empty<ApplicationRequirement>())
            .Where(r => !r.IsDeleted && (applicantId == null || r.ApplicantId == applicantId.Value || totalApplicants <= 1))
            .ToList();

        var photoReq = requirements.FirstOrDefault(r =>
            (r.StoredFileId.HasValue || !string.IsNullOrWhiteSpace(r.Url)) &&
            (r.RequirementId == Guid.Parse("70000000-0000-0000-0000-000000000503") ||
             r.RequirementId == Guid.Parse("70000000-0000-0000-0000-000000000003") ||
             (r.Requirement?.Name != null && (
                 r.Requirement.Name.Contains("1x1", StringComparison.OrdinalIgnoreCase) ||
                 r.Requirement.Name.Contains("2x2", StringComparison.OrdinalIgnoreCase) ||
                 r.Requirement.Name.Contains("photo", StringComparison.OrdinalIgnoreCase) ||
                 r.Requirement.Name.Contains("picture", StringComparison.OrdinalIgnoreCase))) ||
             (r.StoredFile?.ContentType != null && r.StoredFile.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))));

        var photoStoredFileId = photoReq?.StoredFileId ?? photoReq?.StoredFile?.Id;
        var photoUrl = photoReq?.Url;

        // Check admission history in Application.Histories
        var docMarker = $"[ADMITTED_DOC:{docId}]";
        var applicantMarker = applicantId.HasValue ? $"[ADMITTED_APPLICANT:{applicantId.Value}]" : null;

        var admissionHistory = (app.Histories ?? Enumerable.Empty<ApplicationHistory>())
            .OrderByDescending(h => h.Timestamp)
            .FirstOrDefault(h =>
                (h.Remarks != null && h.Remarks.Contains(docMarker, StringComparison.OrdinalIgnoreCase)) ||
                (applicantMarker != null && h.Remarks != null && h.Remarks.Contains(applicantMarker, StringComparison.OrdinalIgnoreCase)) ||
                (totalApplicants <= 1 && h.Action != null && h.Action.Contains("Examinee Admitted", StringComparison.OrdinalIgnoreCase)));

        var isAdmitted = admissionHistory != null;
        var isIssuedOrCompleted =
            doc != null ||
            app.Status == ApplicationStatus.Completed ||
            app.Status == ApplicationStatus.Approved ||
            app.Status == ApplicationStatus.ForIssuance;

        string validationMessage;
        if (isAdmitted)
        {
            validationMessage = $"Examinee was already admitted on {admissionHistory!.Timestamp:MMM dd, yyyy hh:mm tt} by {admissionHistory.StaffName}.";
        }
        else if (isIssuedOrCompleted)
        {
            validationMessage = "Valid Exam Admission Slip verified. Examinee is eligible for admission.";
        }
        else
        {
            validationMessage = $"Admission Slip is not yet finalized (Current Application Status: {app.Status}).";
        }

        string? cleanedAdmissionRemarks = null;
        if (admissionHistory?.Remarks != null)
        {
            cleanedAdmissionRemarks = admissionHistory.Remarks
                .Replace(docMarker, "", StringComparison.OrdinalIgnoreCase);
            if (applicantMarker != null)
            {
                cleanedAdmissionRemarks = cleanedAdmissionRemarks
                    .Replace(applicantMarker, "", StringComparison.OrdinalIgnoreCase);
            }
            cleanedAdmissionRemarks = cleanedAdmissionRemarks.Trim();
        }

        return new ExamAdmissionVerificationDto
        {
            IssuedDocumentId = docId,
            ApplicationId = app.Id,
            ApplicantId = applicantId,
            ScheduleId = app.ScheduleId,
            TenantId = app.TenantId,
            QrVerificationCode = qrCode,
            FormNumber = formNumber,
            LicenseNumber = doc?.LicenseNumber,
            ReferenceNumber = app.ReferenceNumber ?? formNumber,
            ApplicationNumber = app.ApplicationNumber,
            ExamineeName = personName,
            Sex = detail?.Sex ?? FindFieldValue(fieldValues, "sex", "gender"),
            BirthDate = detail != null && detail.BirthDate != default ? detail.BirthDate.ToString("MMM dd, yyyy") : FindFieldValue(fieldValues, "birth"),
            Nationality = detail?.Nationality ?? FindFieldValue(fieldValues, "nationality", "citizenship") ?? "Filipino",
            Email = detail?.EmailAddress ?? FindFieldValue(fieldValues, "email") ?? app.User?.Email,
            ContactNumber = detail?.ContactNumber ?? FindFieldValue(fieldValues, "contact", "mobile"),
            Address = detail?.Address ?? FindFieldValue(fieldValues, "address"),
            PhotoStoredFileId = photoStoredFileId,
            PhotoUrl = photoUrl,
            ExamTitle = examTitle,
            ExamType = examType,
            ExamElements = examElements,
            ExamVenue = examVenue,
            ExamDate = examDate,
            ExamTime = examTime,
            OfficialReceiptNumber = orNumber,
            ApplicationStatus = app.Status.ToString(),
            IsValidForAdmission = isIssuedOrCompleted,
            ValidationMessage = validationMessage,
            IsAdmitted = isAdmitted,
            AdmittedAt = admissionHistory?.Timestamp,
            AdmittedByStaffName = admissionHistory?.StaffName,
            AdmissionRemarks = cleanedAdmissionRemarks
        };
    }

    private static string? FindFieldValue(List<FormFieldValue> values, params string[] keywords)
    {
        foreach (var kw in keywords)
        {
            var match = values.FirstOrDefault(v =>
                !string.IsNullOrWhiteSpace(v.Value) &&
                ((v.CustomLabel != null && v.CustomLabel.Contains(kw, StringComparison.OrdinalIgnoreCase)) ||
                 (v.Field?.Label != null && v.Field.Label.Contains(kw, StringComparison.OrdinalIgnoreCase))));
            if (match != null)
            {
                return match.Value.Trim();
            }
        }
        return null;
    }
}
