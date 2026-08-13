using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class FormSubmission : AuditableEntity
{
    public Guid ApplicationId { get; set; }
    public Application? Application { get; set; }
    public Guid FormId { get; set; }
    public Form? Form { get; set; }
    public Guid ApplicantId { get; set; }
    public Applicant? Applicant { get; set; }
    public ICollection<FormFieldValue> FieldValues { get; set; } = new List<FormFieldValue>();
}

