using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Services;

public class CsvSchemaParserService : ICsvSchemaParserService
{
    private readonly IFormRepository _formRepository;

    public CsvSchemaParserService(IFormRepository formRepository)
    {
        _formRepository = formRepository;
    }

    public async Task<CsvValidationResultDto> ParseAndValidateCsvAsync(Stream csvStream, Guid? serviceId = null, CancellationToken cancellationToken = default)
    {
        using var reader = new StreamReader(csvStream);
        var content = await reader.ReadToEndAsync(cancellationToken);
        
        var lines = content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries);
        var result = new CsvValidationResultDto();

        if (lines.Length <= 1)
        {
            return result;
        }

        Form? form = null;
        if (serviceId.HasValue)
        {
            form = await _formRepository.GetFormByServiceIdAsync(serviceId.Value, cancellationToken);
        }

        var headers = SplitCsvLine(lines[0]);

        for (int i = 1; i < lines.Length; i++)
        {
            var cols = SplitCsvLine(lines[i]);
            var rowData = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (int h = 0; h < headers.Length && h < cols.Length; h++)
            {
                rowData[headers[h]] = cols[h];
            }

            var firstName = GetValue(rowData, "First Name", "FirstName", "First_Name");
            var lastName = GetValue(rowData, "Last Name", "LastName", "Surname");
            var middleName = GetValue(rowData, "Middle Name", "MiddleName");
            var suffix = GetValue(rowData, "Suffix");
            var birthDateStr = GetValue(rowData, "Date of Birth", "BirthDate", "DOB", "Birth Date");
            var email = GetValue(rowData, "Email", "Email Address", "EmailAddress");
            var contactNo = GetValue(rowData, "Contact Number", "ContactNumber", "Phone");
            var schoolAttended = GetValue(rowData, "School Attended", "Education / School Attended", "Education");
            
            var street = GetValue(rowData, "Street/Zone", "Street", "Address");
            var barangay = GetValue(rowData, "Barangay");
            var city = GetValue(rowData, "City");
            var province = GetValue(rowData, "Province");
            var region = GetValue(rowData, "Region");
            var fullAddress = string.Join(", ", new[] { street, barangay, city, province, region }.Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
            if (string.IsNullOrWhiteSpace(fullAddress))
            {
                fullAddress = GetValue(rowData, "Address");
            }

            var applicantName = $"{firstName} {lastName}".Trim();
            if (string.IsNullOrWhiteSpace(applicantName))
            {
                applicantName = $"Row {i} Applicant";
            }

            var appType = GetValue(rowData, "Application Type", "ApplicationType", "Exam Category");
            var examineeType = GetValue(rowData, "Examinee Type", "ExamineeType");

            var remarks = new List<string>();
            var isValid = true;

            // 1. Validate Core Biographical Fields
            if (string.IsNullOrWhiteSpace(firstName))
            {
                isValid = false;
                remarks.Add("First Name is required.");
            }

            if (string.IsNullOrWhiteSpace(lastName))
            {
                isValid = false;
                remarks.Add("Last Name is required.");
            }

            string formattedBirthDate = string.Empty;
            if (string.IsNullOrWhiteSpace(birthDateStr))
            {
                isValid = false;
                remarks.Add("Date of Birth is required.");
            }
            else
            {
                string[] dateFormats = { "M/d/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "yyyy/MM/dd", "d/M/yyyy", "M-d-yyyy", "MM-dd-yyyy", "d-M-yyyy", "d MMM yyyy", "MMM d, yyyy" };
                if (DateTime.TryParseExact(birthDateStr, dateFormats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate) ||
                    DateTime.TryParse(birthDateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate) ||
                    DateTime.TryParse(birthDateStr, out parsedDate))
                {
                    formattedBirthDate = parsedDate.ToString("yyyy-MM-dd");
                }
                else
                {
                    isValid = false;
                    remarks.Add($"Invalid birth date format: '{birthDateStr}'.");
                }
            }

            // 2. Validate Form Builder Fields (sf.IsRequired == true)
            var formFieldValues = new List<FormFieldValueSubmissionDto>();
            if (form != null)
            {
                var sectionFields = form.Sections
                    .SelectMany(s => s.SectionFields)
                    .Where(sf => sf.Field != null && !string.IsNullOrWhiteSpace(sf.Field.Label));

                foreach (var sf in sectionFields)
                {
                    var f = sf.Field!;
                    
                    // Skip non-importable & system-assigned fields
                    if (IsNonImportableField(f.Label) ||
                        string.Equals(f.FieldType, "signature", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(f.FieldType, "checkbox", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(f.FieldType, "file", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(f.FieldType, "system", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    // Extract value from rowData matching Label or Aliases
                    var val = GetValue(rowData, f.Label, MapHeaderAlias(f.Label));
                    
                    // Composite / Derived field helpers
                    if (string.IsNullOrWhiteSpace(val))
                    {
                        if (f.Label.Contains("Full Name", StringComparison.OrdinalIgnoreCase)) val = applicantName;
                        else if (f.Label.Contains("Birth", StringComparison.OrdinalIgnoreCase)) val = formattedBirthDate;
                        else if (f.Label.Contains("Address", StringComparison.OrdinalIgnoreCase)) val = fullAddress;
                        else if (f.Label.Contains("School", StringComparison.OrdinalIgnoreCase) || f.Label.Contains("Education", StringComparison.OrdinalIgnoreCase)) val = schoolAttended;
                        else if (f.Label.Contains("Email", StringComparison.OrdinalIgnoreCase)) val = email;
                    }

                    bool isFieldRequired = sf.IsRequired;
                    if (f.Label.Contains("Education", StringComparison.OrdinalIgnoreCase) || f.Label.Contains("School", StringComparison.OrdinalIgnoreCase))
                    {
                        isFieldRequired = false; // School Attended is optional in bulk spreadsheets
                    }

                    if (isFieldRequired && string.IsNullOrWhiteSpace(val))
                    {
                        isValid = false;
                        remarks.Add($"Required field '{f.Label}' is missing.");
                    }
                    else if (!string.IsNullOrWhiteSpace(val))
                    {
                        formFieldValues.Add(new FormFieldValueSubmissionDto
                        {
                            FieldId = f.Id,
                            FieldLabel = f.Label,
                            Value = val
                        });
                    }
                }
            }

            // Guarantee that per-applicant context fields (examCategory, examineeType) are always
            // present in FormFieldValues, even if the form field label alias lookup missed them.
            // These are critical for ContextKey resolution during requirement validation.
            if (form != null && !string.IsNullOrWhiteSpace(appType))
            {
                var examCategoryField = form.Sections
                    .SelectMany(s => s.SectionFields)
                    .FirstOrDefault(sf => sf.Field != null &&
                        (sf.Field.Label.Contains("Exam Category", StringComparison.OrdinalIgnoreCase) ||
                         sf.Field.Label.Contains("Application Type", StringComparison.OrdinalIgnoreCase)))?.Field;

                if (examCategoryField != null && !formFieldValues.Any(f => f.FieldId == examCategoryField.Id))
                {
                    formFieldValues.Add(new FormFieldValueSubmissionDto
                    {
                        FieldId = examCategoryField.Id,
                        FieldLabel = examCategoryField.Label,
                        Value = appType.Trim()
                    });
                }
            }

            if (form != null && !string.IsNullOrWhiteSpace(examineeType))
            {
                var examineeTypeField = form.Sections
                    .SelectMany(s => s.SectionFields)
                    .FirstOrDefault(sf => sf.Field != null &&
                        sf.Field.Label.Contains("Examinee Type", StringComparison.OrdinalIgnoreCase))?.Field;

                if (examineeTypeField != null && !formFieldValues.Any(f => f.FieldId == examineeTypeField.Id))
                {
                    formFieldValues.Add(new FormFieldValueSubmissionDto
                    {
                        FieldId = examineeTypeField.Id,
                        FieldLabel = examineeTypeField.Label,
                        Value = examineeType.Trim()
                    });
                }
            }

            var mappedApplicant = new ApplicantSubmissionDto
            {
                FirstName = firstName,
                LastName = lastName,
                Email = string.IsNullOrWhiteSpace(email) ? $"{firstName.ToLowerInvariant().Replace(" ", "")}.{lastName.ToLowerInvariant().Replace(" ", "")}@imported.com" : email,
                ContactNumber = string.IsNullOrWhiteSpace(contactNo) ? "09000000000" : contactNo,
                Address = fullAddress,
                BirthDate = !string.IsNullOrWhiteSpace(formattedBirthDate) && DateOnly.TryParse(formattedBirthDate, out var bDate) ? bDate : new DateOnly(1995, 1, 1),
                FormFieldValues = formFieldValues
            };

            var rowPreview = new CsvRowPreviewDto
            {
                RowNumber = i,
                Status = isValid ? "Valid" : "Invalid",
                ApplicantName = applicantName,
                ApplicationType = appType,
                ExamineeType = examineeType,
                ValidationRemarks = isValid ? "Ready for import" : string.Join("; ", remarks),
                Applicant = mappedApplicant,
                RawRowData = rowData
            };

            result.Rows.Add(rowPreview);
        }

        result.TotalRows = result.Rows.Count;
        result.ValidCount = result.Rows.Count(r => r.Status == "Valid");
        result.InvalidCount = result.Rows.Count(r => r.Status == "Invalid");

        return result;
    }

    private static string[] SplitCsvLine(string line)
    {
        var pattern = @"(?:^|,)(?:\s*""(?<val>(?:[^""]|"""")*)""|(?<val>[^,]*))";
        var matches = Regex.Matches(line, pattern);
        var list = new List<string>();
        foreach (Match m in matches)
        {
            if (m.Success)
            {
                var val = m.Groups["val"].Value.Trim().Replace("\"\"", "\"");
                list.Add(val);
            }
        }
        return list.ToArray();
    }

    private static string GetValue(Dictionary<string, string> dict, params string[] possibleKeys)
    {
        foreach (var key in possibleKeys)
        {
            if (string.IsNullOrWhiteSpace(key)) continue;
            var match = dict.FirstOrDefault(k => string.Equals(k.Key, key, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrEmpty(match.Key))
            {
                return match.Value;
            }
        }
        return string.Empty;
    }

    private static bool IsNonImportableField(string label)
    {
        if (string.IsNullOrWhiteSpace(label)) return true;
        var l = label.ToLowerInvariant();
        return l.Contains("special assistance") ||
               l.Contains("special needs") ||
               l.Contains("admission slip") ||
               l.Contains("admission number") ||
               l.Contains("receipt") ||
               l.Contains("amount paid") ||
               l.Contains("payment date");
    }

    private static string MapHeaderAlias(string label)
    {
        if (string.Equals(label, "Exam Category", StringComparison.OrdinalIgnoreCase)) return "Application Type";
        if (string.Equals(label, "Selected Exam Elements", StringComparison.OrdinalIgnoreCase)) return "Class/Element";
        if (label.Contains("Birth", StringComparison.OrdinalIgnoreCase)) return "Date of Birth";
        if (label.Contains("School", StringComparison.OrdinalIgnoreCase) || label.Contains("Education", StringComparison.OrdinalIgnoreCase)) return "School Attended";
        if (label.Contains("Email", StringComparison.OrdinalIgnoreCase)) return "Email";
        return label;
    }
}
