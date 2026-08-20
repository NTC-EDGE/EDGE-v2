using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Queries.GetServiceCsvTemplate;

public class GetServiceCsvTemplateQueryHandler : IRequestHandler<GetServiceCsvTemplateQuery, ApiResponse<ServiceCsvTemplateResultDto>>
{
    private readonly IFormRepository _formRepository;
    private readonly IServiceRepository _serviceRepository;

    public GetServiceCsvTemplateQueryHandler(IFormRepository formRepository, IServiceRepository serviceRepository)
    {
        _formRepository = formRepository;
        _serviceRepository = serviceRepository;
    }

    public async Task<ApiResponse<ServiceCsvTemplateResultDto>> Handle(GetServiceCsvTemplateQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        var form = await _formRepository.GetFormByServiceIdAsync(request.ServiceId, cancellationToken);
        
        var headers = new List<string>();

        if (form != null)
        {
            // Extract dynamic service-specific fields (e.g., Application Type, Examinee Type, Class/Element)
            // Exclude biographical fields, non-tabular fields (signature, checkbox, file, system, admission slip, special assistance)
            var serviceSpecificFields = form.Sections
                .OrderBy(s => s.OrderIndex)
                .SelectMany(s => s.SectionFields.OrderBy(sf => sf.OrderIndex))
                .Select(sf => sf.Field)
                .Where(f => f != null 
                         && !string.IsNullOrWhiteSpace(f.Label)
                         && !f.SyncBackOnSubmit
                         && !IsBiographicalField(f.Label)
                         && !IsNonImportableField(f.Label)
                         && !string.Equals(f.FieldType, "signature", StringComparison.OrdinalIgnoreCase)
                         && !string.Equals(f.FieldType, "checkbox", StringComparison.OrdinalIgnoreCase)
                         && !string.Equals(f.FieldType, "file", StringComparison.OrdinalIgnoreCase)
                         && !string.Equals(f.FieldType, "system", StringComparison.OrdinalIgnoreCase))
                .Select(f => MapLabelToStandardHeader(f!.Label))
                .Distinct(StringComparer.OrdinalIgnoreCase);

            headers.AddRange(serviceSpecificFields);
        }

        // Standard NTC applicant biographical columns (matching official NTC Excel layout)
        var standardBiographical = new[]
        {
            "First Name",
            "Middle Name",
            "Last Name",
            "Suffix",
            "Date of Birth",
            "Sex",
            "Nationality",
            "Region",
            "Province",
            "City",
            "Barangay",
            "Street",
            "Zip Code",
            "School Name",
            "Course / Degree",
            "Year Graduated",
            "Special Order (SO) Number",
            "Email",
            "Contact Number"
        };

        foreach (var bioHeader in standardBiographical)
        {
            if (!headers.Any(h => string.Equals(h, bioHeader, StringComparison.OrdinalIgnoreCase)))
            {
                headers.Add(bioHeader);
            }
        }

        var csvBuilder = new StringBuilder();
        csvBuilder.AppendLine(string.Join(",", headers.Select(h => $"\"{h}\"")));

        // Construct dynamic file name based on service title/code
        string serviceName = service != null ? (!string.IsNullOrWhiteSpace(service.Code) ? $"{service.Code}_{service.Name}" : service.Name) : "Service";
        string sanitizedFileName = string.Join("_", serviceName.Split(Path.GetInvalidFileNameChars()))
            .Replace(" ", "_")
            .Replace("/", "_")
            .Replace("\\", "_");
        
        string fileName = $"{sanitizedFileName}_Template.csv";

        var resultDto = new ServiceCsvTemplateResultDto
        {
            FileName = fileName,
            CsvContent = csvBuilder.ToString()
        };

        return ApiResponse<ServiceCsvTemplateResultDto>.Success(resultDto, "CSV template generated successfully.");
    }

    private static bool IsBiographicalField(string label)
    {
        if (string.IsNullOrWhiteSpace(label)) return true;
        var l = label.ToLowerInvariant();
        return l.Contains("full name") ||
               l.Contains("company name") ||
               l.Contains("education") ||
               l.Contains("school") ||
               l.Contains("address") ||
               l.Contains("contact") ||
               l.Contains("email") ||
               l.Contains("birth");
    }

    private static bool IsNonImportableField(string label)
    {
        if (string.IsNullOrWhiteSpace(label)) return true;
        var l = label.ToLowerInvariant();
        return l.Contains("special assistance") ||
               l.Contains("special needs") ||
               l.Contains("admission slip") ||
               l.Contains("receipt") ||
               l.Contains("amount paid") ||
               l.Contains("payment date");
    }

    private static string MapLabelToStandardHeader(string label)
    {
        if (string.Equals(label, "Exam Category", StringComparison.OrdinalIgnoreCase)) return "Application Type";
        if (string.Equals(label, "Selected Exam Elements", StringComparison.OrdinalIgnoreCase)) return "Class/Element";
        if (label.Contains("School", StringComparison.OrdinalIgnoreCase) || label.Contains("Education", StringComparison.OrdinalIgnoreCase)) return "School Attended";
        return label;
    }
}
