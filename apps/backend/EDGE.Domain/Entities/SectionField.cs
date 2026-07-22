using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class SectionField : BaseEntity
{
    public Guid FormSectionId { get; set; }
    public FormSection? FormSection { get; set; }
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }
    public bool IsRequired { get; set; }
    public int OrderIndex { get; set; }
    public string? VisibilityCondition { get; set; }
}
