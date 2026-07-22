using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ApplicationApplicant : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public Application? Application { get; set; }

    public Guid ApplicantId { get; set; }
    public Applicant? Applicant { get; set; }

    public int SequenceOrder { get; set; } = 1;
}
