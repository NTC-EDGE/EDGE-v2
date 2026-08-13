using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ApplicationService : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public Application? Application { get; set; }

    public Guid? ApplicantId { get; set; }
    public Applicant? Applicant { get; set; }

    public Guid? ServiceId { get; set; }
    public Service? Service { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public ServiceVariant? ServiceVariant { get; set; }

    public ICollection<FormSubmission> FormSubmissions { get; set; } = new List<FormSubmission>();
    public ICollection<ApplicationRequirement> ApplicationRequirements { get; set; } = new List<ApplicationRequirement>();
}

