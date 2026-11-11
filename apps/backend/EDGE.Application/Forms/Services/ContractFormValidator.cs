using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using EDGE.Domain.Entities;

namespace EDGE.Application.Forms.Services;

/// <summary>
/// Validates that the Form's section keys cover every required section in the Service contract.
/// Called inside GetFormByServiceIdQueryHandler before returning the form layout.
/// A failure here surfaces seeding mistakes immediately rather than serving a broken form.
/// </summary>
public class ContractFormValidator
{
    public ContractFormValidationResult Validate(string contractJson, Form form)
    {
        var errors = new List<string>();

        List<ContractSection> requiredSections;
        try
        {
            var jsonOptions = new JsonDocumentOptions
            {
                AllowTrailingCommas = true,
                CommentHandling = JsonCommentHandling.Skip
            };
            using var doc = JsonDocument.Parse(contractJson, jsonOptions);
            var root = doc.RootElement;

            requiredSections = new List<ContractSection>();
            if (root.TryGetProperty("requiredSections", out var sectionsEl) &&
                sectionsEl.ValueKind == JsonValueKind.Array)
            {
                foreach (var s in sectionsEl.EnumerateArray())
                {
                    var key = s.TryGetProperty("key", out var kEl) ? kEl.GetString() ?? string.Empty : string.Empty;
                    var required = s.TryGetProperty("required", out var rEl) && rEl.GetBoolean();
                    requiredSections.Add(new ContractSection(key, required));
                }
            }
        }
        catch (JsonException)
        {
            return new ContractFormValidationResult(new List<string> { "INVALID_CONTRACT_JSON: The service contract could not be parsed." });
        }

        var activeSections = form.Sections.Where(s => !s.IsDeleted).ToList();
        var formKeys = activeSections.Select(s => s.Key).ToHashSet();

        foreach (var section in requiredSections.Where(s => s.Required))
        {
            // These sections belong to first-class domain entities (Applicant, ApplicantDetail, StatementOfAccount, Receipt)
            // or filing steps and must not be required as dynamic FormSection entries.
            if (section.Key.Equals("applicant", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("applicantPerson", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("applicantAddress", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("applicantContact", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("applicantEducation", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("declaration", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("payment", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("fees", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("accounting", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("cashier", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("vasRegistration", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("bsd", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("complainant", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("typeOfCertificate", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("permitType", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("typeOfApplication", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("applicationType", System.StringComparison.OrdinalIgnoreCase) ||
                section.Key.Equals("assistanceRequest", System.StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            if (!formKeys.Contains(section.Key))
                errors.Add($"MISSING_REQUIRED_SECTION: '{section.Key}' is required by the contract but has no matching FormSection.Key.");
        }

        var duplicates = activeSections
            .GroupBy(s => s.Key)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key);

        foreach (var dupe in duplicates)
            errors.Add($"DUPLICATE_SECTION_KEY: '{dupe}' appears more than once in the form layout.");

        return new ContractFormValidationResult(errors);
    }

    /// <summary>Builds the required-section lookup keyed by section key for DTO mapping.</summary>
    public HashSet<string> GetRequiredSectionKeys(string contractJson)
    {
        try
        {
            var jsonOptions = new JsonDocumentOptions
            {
                AllowTrailingCommas = true,
                CommentHandling = JsonCommentHandling.Skip
            };
            using var doc = JsonDocument.Parse(contractJson, jsonOptions);
            var root = doc.RootElement;
            if (!root.TryGetProperty("requiredSections", out var sectionsEl) ||
                sectionsEl.ValueKind != JsonValueKind.Array)
                return new HashSet<string>();

            return sectionsEl.EnumerateArray()
                .Where(s => s.TryGetProperty("required", out var rEl) && rEl.GetBoolean())
                .Select(s => s.TryGetProperty("key", out var kEl) ? kEl.GetString() ?? string.Empty : string.Empty)
                .Where(k => !string.IsNullOrEmpty(k))
                .ToHashSet();
        }
        catch (JsonException)
        {
            return new HashSet<string>();
        }
    }

    private record ContractSection(string Key, bool Required);
}

public class ContractFormValidationResult
{
    public bool IsValid => Errors.Count == 0;
    public List<string> Errors { get; }

    public ContractFormValidationResult(List<string> errors)
    {
        Errors = errors;
    }
}
