using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

public class FormSectionDto
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<FormFieldDto> Fields { get; set; } = new();
}
