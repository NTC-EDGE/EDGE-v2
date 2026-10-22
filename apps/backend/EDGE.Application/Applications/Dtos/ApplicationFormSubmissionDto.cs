using System;
using System.Collections.Generic;

namespace EDGE.Application.Applications.Dtos;

/// <summary>
/// Dedicated DTO for GET /api/v2/applications/:id/form — combines form layout schema with submitted field values.
/// </summary>
public class ApplicationFormSubmissionDto
{
    public Guid? SubmissionId { get; set; }
    public Guid FormId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid ApplicationId { get; set; }
    public Guid? ApplicantId { get; set; }
    public string Version { get; set; } = string.Empty;
    public List<ApplicationFormSectionDto> Sections { get; set; } = new();
}

public class ApplicationFormSectionDto
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public bool Required { get; set; }
    public int OrderIndex { get; set; }
    public List<ApplicationFormFieldValueDto> Fields { get; set; } = new();
}

public class ApplicationFormFieldValueDto
{
    public Guid FieldId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public int OrderIndex { get; set; }
    public string? ValidationRules { get; set; }
    public string? VisibilityCondition { get; set; }
    public string? Value { get; set; }
}
