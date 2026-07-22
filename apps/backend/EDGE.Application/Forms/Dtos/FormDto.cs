using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

/// <summary>
/// Response shape for GET /api/v2/services/:id/form — per plan §3.4.
/// </summary>
public class FormDto
{
    public Guid FormId { get; set; }
    public Guid ServiceId { get; set; }
    public string Version { get; set; } = string.Empty;
    public List<FormSectionDto> Sections { get; set; } = new();
}
