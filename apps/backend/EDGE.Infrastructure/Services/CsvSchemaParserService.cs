using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Services;

public class CsvSchemaParserService : ICsvSchemaParserService
{
    public async Task<CsvValidationResultDto> ParseAndValidateCsvAsync(Stream csvStream, CancellationToken cancellationToken = default)
    {
        using var reader = new StreamReader(csvStream);
        var content = await reader.ReadToEndAsync(cancellationToken);

        var lines = content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries);
        var result = new CsvValidationResultDto();

        if (lines.Length <= 1)
        {
            return result;
        }

        var headers = lines[0].Split(',').Select(h => h.Trim().Trim('"')).ToArray();

        for (int i = 1; i < lines.Length; i++)
        {
            var cols = lines[i].Split(',').Select(c => c.Trim().Trim('"')).ToArray();
            var rowData = new Dictionary<string, string>();
            for (int h = 0; h < headers.Length && h < cols.Length; h++)
            {
                rowData[headers[h]] = cols[h];
            }

            var applicantName = GetValue(rowData, "Applicant Name", "Name", "FirstName") + " " + GetValue(rowData, "LastName", "Surname");
            applicantName = applicantName.Trim();
            if (string.IsNullOrWhiteSpace(applicantName))
            {
                applicantName = $"Row {i} Applicant";
            }

            var appType = GetValue(rowData, "Application Type", "ApplicationType");
            var examineeType = GetValue(rowData, "Examinee Type", "ExamineeType");
            var birthDate = GetValue(rowData, "BirthDate", "Date of Birth", "DOB");

            var remarks = new List<string>();
            var isValid = true;

            if (!string.IsNullOrWhiteSpace(birthDate) && !DateTime.TryParse(birthDate, out _))
            {
                isValid = false;
                remarks.Add("Date of Birth must be mm/dd/yyyy.");
            }

            if (string.IsNullOrWhiteSpace(applicantName))
            {
                isValid = false;
                remarks.Add("Applicant name is required.");
            }

            var rowPreview = new CsvRowPreviewDto
            {
                RowNumber = i,
                Status = isValid ? "Valid" : "Invalid",
                ApplicantName = applicantName,
                ApplicationType = string.IsNullOrWhiteSpace(appType) ? "Radiotelegraphy" : appType,
                ExamineeType = string.IsNullOrWhiteSpace(examineeType) ? "First Taker" : examineeType,
                ValidationRemarks = isValid ? "Ready for import" : string.Join("; ", remarks),
                RawRowData = rowData
            };

            result.Rows.Add(rowPreview);
        }

        result.TotalRows = result.Rows.Count;
        result.ValidCount = result.Rows.Count(r => r.Status == "Valid");
        result.InvalidCount = result.Rows.Count(r => r.Status == "Invalid");

        return result;
    }

    private static string GetValue(Dictionary<string, string> dict, params string[] possibleKeys)
    {
        foreach (var key in possibleKeys)
        {
            var match = dict.FirstOrDefault(k => string.Equals(k.Key, key, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrEmpty(match.Key))
            {
                return match.Value;
            }
        }
        return string.Empty;
    }
}
