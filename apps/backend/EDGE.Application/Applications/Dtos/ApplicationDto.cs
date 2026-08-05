using System;
using System.Collections.Generic;
using EDGE.Application.Applicants.Dtos;

namespace EDGE.Application.Applications.Dtos;

public class ApplicationDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ScheduleId { get; set; }
    public Guid? RegionId { get; set; }
    public string? Office { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public string SubmissionMode { get; set; } = string.Empty;
    public string? DataEntryMethod { get; set; }
    public string? Remarks { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<ApplicationServiceDto> Services { get; set; } = new();
    public List<ApplicantDto> Applicants { get; set; } = new();
    public List<ApplicationRequirementDto> Requirements { get; set; } = new();
}

public class ApplicationServiceDto
{
    public Guid Id { get; set; }
    public Guid? ServiceCategoryId { get; set; }
    public Guid? ServiceId { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public string? ApplicationTypeKey { get; set; }
    public string? DynamicDataJson { get; set; }

    public List<Guid> ServiceVariantElementIds
    {
        get
        {
            if (string.IsNullOrWhiteSpace(DynamicDataJson)) return new();
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(DynamicDataJson);
                if (doc.RootElement.TryGetProperty("selectedElementIds", out var elementIdsProp) &&
                    elementIdsProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    return elementIdsProp.EnumerateArray()
                        .Select(x => x.TryGetGuid(out var g) ? g : Guid.Empty)
                        .Where(g => g != Guid.Empty)
                        .ToList();
                }
            }
            catch
            {
                // Ignore parse errors
            }
            return new();
        }
    }
}

public class ApplicationRequirementDto
{
    public Guid Id { get; set; }
    public Guid ApplicantId { get; set; }
    public Guid RequirementId { get; set; }
    public Guid? ServiceVariantRequirementId { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
}
