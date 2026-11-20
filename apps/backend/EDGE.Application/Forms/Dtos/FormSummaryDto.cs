using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

public class FormSummaryDto
{
    public Guid FormId { get; set; }
    public string? Key { get; set; }
    public Guid ServiceId { get; set; }
    public Guid? ServiceCategoryId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceCode { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string Version { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool CategorySelectionRequired { get; set; }
    public int LinkedVariantsCount { get; set; }
    public List<Guid> CustomizedVariantIds { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<FormVersionSummaryDto> AvailableVersions { get; set; } = new();
}
