using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps database Application entities (with FormFieldValues, ApplicantDetail, User)
/// to official printable Request & Complaint form models:
/// - NTC 1-24: Affidavit of Ownership and Loss with Undertaking (Blocking / Unblocking)
/// - NTC 1-25: Complaint Form (Rev 03 03/31/2025)
/// </summary>
public static class ApplicationFormPrintMapper
{
    public static bool IsRequestOrComplaint(EDGE.Domain.Entities.Application app)
    {
        var primaryService = app.ApplicationApplicants.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var primaryVariant = app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

        var sCode = (primaryService?.Code ?? string.Empty).ToUpperInvariant();
        var sName = (primaryService?.Name ?? string.Empty).ToUpperInvariant();
        var cName = (primaryService?.ServiceCategory?.Name ?? primaryService?.Group ?? string.Empty).ToUpperInvariant();
        var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToUpperInvariant();

        if (sCode.Contains("NTC_1_24") || sCode.Contains("NTC_1_25") || sCode.Contains("NTC_REQ_COMPLAINTS"))
            return true;

        if (cName.Contains("REQUEST") || cName.Contains("COMPLAINT") || sName.Contains("REQUEST") || sName.Contains("COMPLAINT"))
            return true;

        if (vDesc.Contains("BLOCKING") || vDesc.Contains("UNBLOCKING") || vDesc.Contains("SPAM") || vDesc.Contains("SCAM") || vDesc.Contains("TAPE PRESERVATION"))
            return true;

        var allFieldValues = app.FormSubmissions?.SelectMany(fs => fs.FieldValues).ToList() ?? new List<FormFieldValue>();
        return allFieldValues.Any(f => MatchesKey(f, "action_requested", "device_particulars", "sim_mobile_numbers", "provider_business_name", "complaint_types", "state_briefly_details"));
    }

    public static bool IsBlockingOrUnblocking(EDGE.Domain.Entities.Application app)
    {
        var primaryVariant = app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToUpperInvariant();

        if (vDesc.Contains("BLOCKING") || vDesc.Contains("UNBLOCKING"))
            return true;

        var allFieldValues = app.FormSubmissions?.SelectMany(fs => fs.FieldValues).ToList() ?? new List<FormFieldValue>();
        var actionReq = FindFieldValue(allFieldValues, "action_requested", "action requested");
        if (!string.IsNullOrWhiteSpace(actionReq))
            return true;

        var devPart = FindFieldValue(allFieldValues, "device_particulars", "device particulars");
        var simPart = FindFieldValue(allFieldValues, "sim_mobile_numbers", "sim mobile");
        return !string.IsNullOrWhiteSpace(devPart) || !string.IsNullOrWhiteSpace(simPart);
    }

    public static Ntc124Application MapToNtc124(EDGE.Domain.Entities.Application app)
    {
        var model = new Ntc124Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31)
        };

        var applicant = app.ApplicationApplicants.Select(aa => aa.Applicant).FirstOrDefault();
        var person = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? app.User?.CompanyDetail;

        var fullName = person != null
            ? $"{person.FirstName} {person.LastName}".Trim()
            : (company?.Name ?? $"{app.User?.FirstName} {app.User?.LastName}".Trim());

        model.AffiantName = !string.IsNullOrWhiteSpace(fullName) ? fullName : "Affiant";
        model.Citizenship = !string.IsNullOrWhiteSpace(person?.Nationality) ? person.Nationality : "Filipino";

        if (person?.BirthDate != default && person?.BirthDate.Year > 1900)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var age = today.Year - person.BirthDate.Year;
            if (person.BirthDate > today.AddYears(-age)) age--;
            model.Age = Math.Max(1, age);
        }

        var fullAddress = person?.Address ?? company?.Address ?? $"{app.User?.Unit} {app.User?.Street}".Trim();
        model.ResidentialAddress = new Address { Street = fullAddress };
        model.TelephoneNumber = person?.ContactNumber ?? company?.ContactNumber ?? app.User?.ContactNumber ?? "";

        var allFieldValues = app.FormSubmissions?.SelectMany(fs => fs.FieldValues).ToList() ?? new List<FormFieldValue>();

        // Action Requested
        var actionVal = FindFieldValue(allFieldValues, "action_requested", "action requested") ?? "";
        var primaryVariant = app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToUpperInvariant();

        if (actionVal.Contains("UNBLOCK", StringComparison.OrdinalIgnoreCase) || vDesc.Contains("UNBLOCKING"))
        {
            model.ActionRequested = ActionRequested124.Unblock;
        }
        else
        {
            model.ActionRequested = ActionRequested124.Block;
        }

        // Device Particulars
        ExtractDeviceParticulars(allFieldValues, model);

        // Incident Details
        var incident = model.Incident;
        var lossReason = FindFieldValue(allFieldValues, "loss_reason", "incident type", "incident", "reason", "loss") ?? "";
        if (lossReason.Contains("stolen", StringComparison.OrdinalIgnoreCase))
        {
            incident.IncidentType = IncidentType124.Stolen;
        }
        else if (lossReason.Contains("other", StringComparison.OrdinalIgnoreCase))
        {
            incident.IncidentType = IncidentType124.Others;
            incident.OthersSpecification = FindFieldValue(allFieldValues, "incident_others_specify", "others_specification", "please specify") ?? "";
        }
        else
        {
            incident.IncidentType = IncidentType124.LostMisplaced;
        }

        var filingDateVal = FindFieldValue(allFieldValues, "date_of_filing", "date of filing");
        if (!string.IsNullOrWhiteSpace(filingDateVal) && DateOnly.TryParse(filingDateVal, out var parsedFilingDate))
        {
            incident.DateOfFiling = parsedFilingDate;
        }

        var recoveryDateVal = FindFieldValue(allFieldValues, "date_of_recovery", "date of recovery");
        if (!string.IsNullOrWhiteSpace(recoveryDateVal) && DateOnly.TryParse(recoveryDateVal, out var parsedRecoveryDate))
        {
            incident.DateOfRecovery = parsedRecoveryDate;
        }

        incident.UnblockingDetails = FindFieldValue(allFieldValues, "unblocking_details", "details") ?? "";

        var sexVal = FindFieldValue(allFieldValues, "sex") ?? person?.Sex ?? app.User?.Sex ?? "";
        if (sexVal.StartsWith("F", StringComparison.OrdinalIgnoreCase))
        {
            incident.Sex = Sex.Female;
        }
        else
        {
            incident.Sex = Sex.Male;
        }

        var ageGroupVal = FindFieldValue(allFieldValues, "age_group", "age") ?? "";
        incident.AgeGroup = ResolveAgeGroup(ageGroupVal, model.Age);

        var timeOfDayVal = FindFieldValue(allFieldValues, "time_of_day", "time of incident") ?? "";
        incident.TimeOfDay = timeOfDayVal.Contains("night", StringComparison.OrdinalIgnoreCase)
            ? TimeOfDay124.Nighttime
            : TimeOfDay124.Daytime;

        incident.PlaceOfIncident = FindFieldValue(allFieldValues, "place_of_incident", "place") ?? "";

        var dateVal = FindFieldValue(allFieldValues, "date_of_incident", "date");
        if (!string.IsNullOrWhiteSpace(dateVal) && DateOnly.TryParse(dateVal, out var parsedDate))
        {
            incident.DateOfIncident = parsedDate;
        }
        else
        {
            incident.DateOfIncident = DateOnly.FromDateTime(app.CreatedAt);
        }

        // Proof of Ownership checkboxes
        var proofType = FindFieldValue(allFieldValues, "proof_of_ownership_type", "ownership") ?? "";
        var idType = FindFieldValue(allFieldValues, "identity_proof_type", "valid id") ?? "";

        var p = model.ProofOfOwnership;
        if (idType.Contains("school", StringComparison.OrdinalIgnoreCase)) p.CopySchoolId = true;
        else if (idType.Contains("birth", StringComparison.OrdinalIgnoreCase) || idType.Contains("nbi", StringComparison.OrdinalIgnoreCase)) p.CopyBirthCertOrNbi = true;
        else p.CopyGovernmentId = true;

        if (proofType.Contains("box", StringComparison.OrdinalIgnoreCase)) p.BoxWithImei = true;
        else if (proofType.Contains("certificate", StringComparison.OrdinalIgnoreCase)) p.CertificateOfPurchase = true;
        else if (proofType.Contains("affidavit", StringComparison.OrdinalIgnoreCase)) p.AffidavitInAbsence = true;
        else p.ProofOfOwnershipReceipt = true;

        // Declaration
        model.Declaration = new Declaration
        {
            SignatoryName = model.AffiantName,
            DateAccomplished = DateOnly.FromDateTime(app.CreatedAt)
        };

        return model;
    }

    public static Ntc125Application MapToNtc125(EDGE.Domain.Entities.Application app)
    {
        var model = new Ntc125Application
        {
            ApplicationId = app.Id,
            ApplicationNumber = app.ApplicationNumber ?? app.ReferenceNumber ?? app.Id.ToString(),
            ReferenceNumber = app.ReferenceNumber ?? app.ApplicationNumber ?? app.Id.ToString(),
            FormNo = "NTC 1-25",
            RevisionNo = "03",
            RevisionDate = new DateOnly(2025, 3, 31)
        };

        var applicant = app.ApplicationApplicants.Select(aa => aa.Applicant).FirstOrDefault();
        var person = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? app.User?.CompanyDetail;

        var fullName = person != null
            ? $"{person.FirstName} {person.LastName}".Trim()
            : (company?.Name ?? $"{app.User?.FirstName} {app.User?.LastName}".Trim());

        var comp = model.Complainant;
        comp.Name = !string.IsNullOrWhiteSpace(fullName) ? fullName : "Complainant";
        comp.Sex = !string.IsNullOrWhiteSpace(person?.Sex) ? person.Sex : (app.User?.Sex ?? "N/A");
        comp.Nationality = !string.IsNullOrWhiteSpace(person?.Nationality) ? person.Nationality : "Filipino";

        var fullAddress = person?.Address ?? company?.Address ?? $"{app.User?.Unit} {app.User?.Street}".Trim();
        comp.ResidentialAddress = new Address { Street = fullAddress };
        comp.ContactNumber = person?.ContactNumber ?? company?.ContactNumber ?? app.User?.ContactNumber ?? "";
        comp.Email = person?.EmailAddress ?? company?.Email ?? app.User?.Email ?? "";

        var allFieldValues = app.FormSubmissions?.SelectMany(fs => fs.FieldValues).ToList() ?? new List<FormFieldValue>();

        var civilVal = FindFieldValue(allFieldValues, "civil_status", "civil status");
        comp.CivilStatus = !string.IsNullOrWhiteSpace(civilVal) ? civilVal : "Single";

        // Service Provider Particulars
        var sp = model.ServiceProvider;
        sp.BusinessName = FindFieldValue(allFieldValues, "provider_business_name", "business name", "telecommunications provider") ?? "";
        sp.BusinessAddress = FindFieldValue(allFieldValues, "provider_business_address", "business address") ?? "";
        sp.ContactNumber = FindFieldValue(allFieldValues, "provider_contact_number", "provider contact") ?? "";

        // Nature of Complaint
        var nat = model.NatureOfComplaint;
        var complaintTypesVal = FindFieldValue(allFieldValues, "complaint_types", "nature of complaint") ?? "";
        if (!string.IsNullOrWhiteSpace(complaintTypesVal))
        {
            var trimmed = complaintTypesVal.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var el in doc.RootElement.EnumerateArray())
                        {
                            var s = el.GetString();
                            if (!string.IsNullOrWhiteSpace(s)) nat.ComplaintTypes.Add(s);
                        }
                    }
                }
                catch
                {
                    nat.ComplaintTypes.Add(complaintTypesVal);
                }
            }
            else
            {
                nat.ComplaintTypes.AddRange(complaintTypesVal.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
            }
        }

        // If no types parsed, check if variant specifies spam/scam
        if (nat.ComplaintTypes.Count == 0)
        {
            var primaryVariant = app.ApplicationApplicants.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
            var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToLowerInvariant();
            if (vDesc.Contains("spam")) nat.ComplaintTypes.Add("Spam");
            else if (vDesc.Contains("scam")) nat.ComplaintTypes.Add("Scam");
            else if (vDesc.Contains("service")) nat.ComplaintTypes.Add("Poor Service (Technical Service/Customer Service)");
            else if (vDesc.Contains("tape")) nat.ComplaintTypes.Add("Request for Mandatory Tape Preservation");
            else nat.ComplaintTypes.Add("Billing Complaint");
        }

        nat.OthersSpecification = FindFieldValue(allFieldValues, "others_specification", "if others") ?? "";

        var dateVal = FindFieldValue(allFieldValues, "date_of_incident", "date of transaction");
        if (!string.IsNullOrWhiteSpace(dateVal) && DateOnly.TryParse(dateVal, out var pDate))
        {
            nat.DateOfIncident = pDate;
        }
        else
        {
            nat.DateOfIncident = DateOnly.FromDateTime(app.CreatedAt);
        }

        nat.TimeOfIncident = FindFieldValue(allFieldValues, "time_of_incident", "time of transaction") ?? "";

        // Details of Complaint
        model.StateBrieflyDetails = FindFieldValue(allFieldValues, "state_briefly_details", "details of complaint", "briefly details") ?? "";

        // Attached Proof Documents Repeater
        ExtractAttachedProofDocuments(allFieldValues, model);

        // Declaration
        model.Declaration = new Declaration
        {
            SignatoryName = comp.Name,
            DateAccomplished = DateOnly.FromDateTime(app.CreatedAt)
        };

        return model;
    }

    private static void ExtractDeviceParticulars(List<FormFieldValue> fieldValues, Ntc124Application model)
    {
        var devField = FindField(fieldValues, "device_particulars", "device particulars");
        if (devField != null && !string.IsNullOrWhiteSpace(devField.Value))
        {
            var trimmed = devField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        var imeis = new List<string>();
                        var models = new List<string>();

                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            if (row.TryGetProperty("imei_number", out var i) || row.TryGetProperty("imei", out i))
                            {
                                var iv = i.GetString() ?? (i.ValueKind == JsonValueKind.Number ? i.GetInt64().ToString() : "");
                                if (!string.IsNullOrWhiteSpace(iv)) imeis.Add(iv);
                            }
                            if (row.TryGetProperty("make_model_type", out var m) || row.TryGetProperty("model", out m) || row.TryGetProperty("make", out m))
                            {
                                var mv = m.GetString();
                                if (!string.IsNullOrWhiteSpace(mv)) models.Add(mv);
                            }
                        }

                        if (imeis.Count > 0) model.ImeiNo = string.Join(" / ", imeis);
                        if (models.Count > 0) model.MakeModelType = string.Join(" / ", models);
                    }
                }
                catch
                {
                    model.MakeModelType = devField.Value;
                }
            }
            else
            {
                model.MakeModelType = devField.Value;
            }
        }

        // SIM Numbers Repeater
        var simField = FindField(fieldValues, "sim_mobile_numbers", "sim mobile");
        if (simField != null && !string.IsNullOrWhiteSpace(simField.Value))
        {
            var trimmed = simField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        var nums = new List<string>();
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            if (row.TryGetProperty("mobile_number", out var num) || row.TryGetProperty("mobile", out num) || row.TryGetProperty("sim", out num))
                            {
                                var nv = num.GetString();
                                if (!string.IsNullOrWhiteSpace(nv)) nums.Add(nv);
                            }
                        }
                        if (nums.Count > 0) model.SimMobileNumber = string.Join(" / ", nums);
                    }
                }
                catch
                {
                    model.SimMobileNumber = simField.Value;
                }
            }
            else
            {
                model.SimMobileNumber = simField.Value;
            }
        }

        if (string.IsNullOrWhiteSpace(model.SimMobileNumber))
        {
            model.SimMobileNumber = model.TelephoneNumber;
        }
    }

    private static void ExtractAttachedProofDocuments(List<FormFieldValue> fieldValues, Ntc125Application model)
    {
        var attField = FindField(fieldValues, "attached_proof_documents", "attached proof");
        if (attField != null && !string.IsNullOrWhiteSpace(attField.Value))
        {
            var trimmed = attField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            var desc = "";
                            var file = "";
                            if (row.TryGetProperty("document_description", out var d)) desc = d.GetString() ?? "";
                            if (row.TryGetProperty("attachment_file", out var f)) file = f.GetString() ?? "";

                            if (!string.IsNullOrWhiteSpace(desc) || !string.IsNullOrWhiteSpace(file))
                            {
                                model.AttachedProofDocuments.Add(new AttachedProofDocument
                                {
                                    DocumentDescription = !string.IsNullOrWhiteSpace(desc) ? desc : "Supporting Document",
                                    AttachmentFileName = !string.IsNullOrWhiteSpace(file) ? file : "Document_Proof.pdf"
                                });
                            }
                        }
                    }
                }
                catch
                {
                    // Ignore JSON parsing issues
                }
            }
        }
    }

    private static AgeGroup124 ResolveAgeGroup(string raw, int numericAge)
    {
        var lower = raw.ToLowerInvariant();
        if (lower.Contains("below 18") || lower.Contains("<18")) return AgeGroup124.Below18;
        if (lower.Contains("18-29") || lower.Contains("18_29") || lower.Contains("18 to 29")) return AgeGroup124.Age18_29;
        if (lower.Contains("30-39") || lower.Contains("30_39") || lower.Contains("30 to 39")) return AgeGroup124.Age30_39;
        if (lower.Contains("40-49") || lower.Contains("40_49") || lower.Contains("40 to 49")) return AgeGroup124.Age40_49;
        if (lower.Contains("50-59") || lower.Contains("50_59") || lower.Contains("50 to 59")) return AgeGroup124.Age50_59;
        if (lower.Contains("60")) return AgeGroup124.Age60Up;

        if (numericAge > 0)
        {
            if (numericAge < 18) return AgeGroup124.Below18;
            if (numericAge <= 29) return AgeGroup124.Age18_29;
            if (numericAge <= 39) return AgeGroup124.Age30_39;
            if (numericAge <= 49) return AgeGroup124.Age40_49;
            if (numericAge <= 59) return AgeGroup124.Age50_59;
            return AgeGroup124.Age60Up;
        }

        return AgeGroup124.Age18_29;
    }

    private static string? FindFieldValue(List<FormFieldValue> fieldValues, params string[] keywords)
    {
        var f = FindField(fieldValues, keywords);
        return f?.Value;
    }

    private static FormFieldValue? FindField(List<FormFieldValue> fieldValues, params string[] keywords)
    {
        return fieldValues.FirstOrDefault(f => MatchesKey(f, keywords));
    }

    private static bool MatchesKey(FormFieldValue f, params string[] keywords)
    {
        var label = (f.CustomLabel ?? f.Field?.Label ?? string.Empty).ToLowerInvariant();
        return keywords.Any(k => label.Contains(k.ToLowerInvariant()));
    }
}
