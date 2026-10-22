using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

/// <summary>
/// Response shape for GET /api/v2/services/:id/form and /api/v2/forms
/// </summary>
public class FormDto
{
    public Guid FormId { get; set; }
    public Guid ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceCode { get; set; }
    public string Version { get; set; } = string.Empty;
    public bool CategorySelectionRequired { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<FormSectionDto> Sections { get; set; } = new();
}
