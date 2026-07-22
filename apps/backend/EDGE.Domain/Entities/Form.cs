using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Form : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public Service? Service { get; set; }
    public string Version { get; set; } = "1.0";
    public bool CategorySelectionRequired { get; set; }
    public ICollection<FormSection> Sections { get; set; } = new List<FormSection>();
}
