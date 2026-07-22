using System;
using System.Collections.Generic;

namespace EDGE.Application.Forms.Dtos;

public class FormSectionDto
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    /// <summary>
    /// Derived from the Service contract's requiredSections list.
    /// True when this section's key appears in contract.requiredSections with required=true.
    /// Justine's frontend uses this to mark sections mandatory before submission.
    /// </summary>
    public bool Required { get; set; }
    public int OrderIndex { get; set; }
    public List<FormFieldDto> Fields { get; set; } = new();
}
