using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class FormSection : AuditableEntity
{
    public Guid FormId { get; set; }
    public Form? Form { get; set; }
    public string Key { get; set; } = string.Empty; // Must match Contract.requiredSections[].key exactly
    public string Title { get; set; } = string.Empty; // Display text
    public int OrderIndex { get; set; }
    public ICollection<SectionField> SectionFields { get; set; } = new List<SectionField>();
}
