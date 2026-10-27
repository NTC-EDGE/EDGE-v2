using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

/// <summary>
/// Lightweight summary of a specific version for an application type / service.
/// </summary>
public class FormVersionSummaryDto
{
    public Guid FormId { get; set; }
    public string Version { get; set; } = string.Empty;
    public string? Name { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int SectionsCount { get; set; }
    public int FieldsCount { get; set; }
}

/// <summary>
/// Response shape for GET /api/v2/services/:id/form and /api/v2/forms
/// </summary>
public class FormDto
{
    public Guid FormId { get; set; }
    public Guid ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceCode { get; set; }
    public string? Name { get; set; }
    public string Version { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool CategorySelectionRequired { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<FormSectionDto> Sections { get; set; } = new();
    public List<FormVersionSummaryDto> AvailableVersions { get; set; } = new();
}
