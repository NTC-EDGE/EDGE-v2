using System;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class Applicant : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Guid? UserId { get; set; }
    public bool IsGuest { get; set; }
    public ApplicantType ApplicantType { get; set; }
    public Guid? ApplicantDetailId { get; set; }
    public ApplicantDetail? ApplicantDetail { get; set; }
}
