using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class FormFieldValue : BaseEntity
{
    public Guid FormSubmissionId { get; set; }
    public FormSubmission? FormSubmission { get; set; }
    public Guid FieldId { get; set; }
    public Field? Field { get; set; }
    public string? CustomLabel { get; set; }
    public string Value { get; set; } = string.Empty;
}
