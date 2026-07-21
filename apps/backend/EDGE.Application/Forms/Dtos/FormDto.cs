using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

public class FormDto
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public string Version { get; set; } = string.Empty;
    public bool CategorySelectionRequired { get; set; }
    public List<FormSectionDto> Sections { get; set; } = new();
}
