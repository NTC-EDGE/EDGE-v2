using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations;

/// <summary>
/// Inspects the Form Builder schema and submitted field values of an application to determine
/// whether the Form Builder asks for "No. of Years" / "Validity Years" and what value was provided.
/// If the Form Builder does not ask for No. of Years, returns (AsksForYears: false, ValidityYears: 0)
/// so fees are never multiplied by years. If "No. of Years" is added in the Form Builder, it is
/// automatically detected and applied to the SOA.
/// </summary>
public static class FormBuilderYearsHelper
{
    public static readonly Guid CanonicalNoOfYearsFieldId = Guid.Parse("fd000000-0000-0000-0000-000000000201");

    public static bool IsYearsFieldLabel(string? label)
    {
        if (string.IsNullOrWhiteSpace(label)) return false;
        var lower = label.Trim().ToLowerInvariant();

        // Exclude unrelated fields that contain the word "year"
        if (lower.Contains("graduat") ||
            lower.Contains("birth") ||
            lower.Contains("experience") ||
            lower.Contains("age") ||
            lower.Contains("school"))
        {
            return false;
        }

        return lower == "no. of years" ||
               lower == "no of years" ||
               lower == "no.of years" ||
               lower == "number of years" ||
               lower == "no. of yrs" ||
               lower == "no of yrs" ||
               lower == "no. of yr" ||
               lower == "no of yr" ||
               lower == "validity years" ||
               lower == "validity (years)" ||
               lower == "years of validity" ||
               lower == "years applied" ||
               lower == "applied years" ||
               lower == "years" ||
               lower.Contains("number of years") ||
               lower.Contains("no. of years") ||
               lower.Contains("no of years") ||
               lower.Contains("no.of years") ||
               lower.Contains("no. of yrs") ||
               lower.Contains("no of yrs") ||
               lower.Contains("validity years") ||
               lower.Contains("years applied");
    }

    public static bool IsYearsField(Field? field, Guid? fieldId = null)
    {
        var resolvedId = field?.Id ?? fieldId;
        if (resolvedId.HasValue && resolvedId.Value == CanonicalNoOfYearsFieldId)
        {
            return true;
        }

        return IsYearsFieldLabel(field?.Label);
    }

    public static (bool AsksForYears, int ValidityYears) ResolveFormBuilderYears(
        Domain.Entities.Application? app,
        Guid? targetApplicantId = null,
        int? requestedValidityYears = null,
        ServiceCategoryType? category = null,
        Form? activeServiceForm = null)
    {
        if (app == null)
        {
            var fallback = requestedValidityYears.HasValue && requestedValidityYears.Value > 0
                ? requestedValidityYears.Value
                : 0;
            return (fallback > 0, fallback);
        }

        var targetApplicant = targetApplicantId.HasValue && targetApplicantId.Value != Guid.Empty
            ? app.ApplicationApplicants?.FirstOrDefault(aa => aa.ApplicantId == targetApplicantId.Value)?.Applicant
            : app.ApplicationApplicants?.FirstOrDefault()?.Applicant;

        // Collect relevant FormSubmissions (prioritizing targetApplicant)
        var submissions = new List<FormSubmission>();
        if (targetApplicant?.FormSubmission != null)
        {
            submissions.Add(targetApplicant.FormSubmission);
        }

        if (app.FormSubmissions != null)
        {
            if (targetApplicant != null)
            {
                submissions.AddRange(app.FormSubmissions.Where(fs => fs.ApplicantId == targetApplicant.Id && !submissions.Contains(fs)));
            }
            submissions.AddRange(app.FormSubmissions.Where(fs => !submissions.Contains(fs)));
        }

        if (app.ApplicationApplicants != null)
        {
            foreach (var aa in app.ApplicationApplicants)
            {
                if (aa.Applicant?.FormSubmission != null && !submissions.Contains(aa.Applicant.FormSubmission))
                {
                    submissions.Add(aa.Applicant.FormSubmission);
                }
            }
        }

        var formSchemaHasYearsField = false;
        int? submittedYearsValue = null;

        // 1. Check live active Form Builder schema for the service/variant if available
        if (activeServiceForm?.Sections != null)
        {
            foreach (var section in activeServiceForm.Sections.Where(s => !s.IsDeleted))
            {
                if (section.SectionFields == null) continue;
                foreach (var sf in section.SectionFields)
                {
                    if (IsYearsField(sf.Field, sf.FieldId))
                    {
                        formSchemaHasYearsField = true;
                    }
                }
            }
        }

        // 2. Check application FormSubmissions (submitted field values & attached Form schema)
        foreach (var sub in submissions)
        {
            if (sub.FieldValues != null)
            {
                foreach (var fv in sub.FieldValues)
                {
                    if (fv == null) continue;
                    if (IsYearsField(fv.Field, fv.FieldId))
                    {
                        formSchemaHasYearsField = true;
                        var parsed = TryParsePositiveYears(fv.Value);
                        if (parsed.HasValue && !submittedYearsValue.HasValue)
                        {
                            submittedYearsValue = parsed.Value;
                        }
                    }
                }
            }

            if (sub.Form?.Sections != null)
            {
                foreach (var section in sub.Form.Sections.Where(s => !s.IsDeleted))
                {
                    if (section.SectionFields == null) continue;
                    foreach (var sf in section.SectionFields)
                    {
                        if (IsYearsField(sf.Field, sf.FieldId))
                        {
                            formSchemaHasYearsField = true;
                        }
                    }
                }
            }
        }

        // If no FormSubmissions and no activeServiceForm were loaded (e.g., synthetic unit-test entity),
        // only apply years if explicitly requested in the command/query and not an Exam/Complaint test.
        if (submissions.Count == 0 && activeServiceForm == null)
        {
            var resolvedCategory = category
                ?? targetApplicant?.Service?.ServiceCategory?.Type
                ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.Service?.ServiceCategory?.Type).FirstOrDefault(t => t != null);

            if (resolvedCategory == ServiceCategoryType.Exam || resolvedCategory == ServiceCategoryType.RequestsAndComplaints)
            {
                return (false, 0);
            }

            if (requestedValidityYears.HasValue && requestedValidityYears.Value > 0)
            {
                return (true, requestedValidityYears.Value);
            }
            return (false, 0);
        }

        if (!formSchemaHasYearsField)
        {
            return (false, 0);
        }

        var effectiveYears = submittedYearsValue
            ?? (requestedValidityYears.HasValue && requestedValidityYears.Value > 0 ? requestedValidityYears.Value : 1);

        return (true, Math.Max(1, effectiveYears));
    }

    private static int? TryParsePositiveYears(string? rawValue)
    {
        if (string.IsNullOrWhiteSpace(rawValue)) return null;
        var trimmed = rawValue.Trim();
        if (int.TryParse(trimmed, out var direct) && direct > 0)
        {
            return direct;
        }

        var match = Regex.Match(trimmed, @"\b(\d+)\b");
        if (match.Success && int.TryParse(match.Groups[1].Value, out var extracted) && extracted > 0)
        {
            return extracted;
        }

        return null;
    }
}
