using System;
using System.Collections.Generic;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class Application : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public Guid? ScheduleId { get; set; }
    public Schedule? Schedule { get; set; }
    public Guid? RegionId { get; set; }
    public Region? Region { get; set; }
    public string? Office { get; set; }
    public string? ApplicationNumber { get; set; }
    public string? ReferenceNumber { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;
    public SubmissionMode SubmissionMode { get; set; } = SubmissionMode.Single;
    public DataEntryMethod? DataEntryMethod { get; set; }
    public string? Remarks { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public bool IsGuest { get; set; }
    public bool IsPinned { get; set; } = false;
    public bool IsArchived { get; set; } = false;

    public ICollection<ApplicationService> ApplicationServices { get; set; } = new List<ApplicationService>();
    public ICollection<ApplicationApplicant> ApplicationApplicants { get; set; } = new List<ApplicationApplicant>();
    public ICollection<ApplicationRequirement> ApplicationRequirements { get; set; } = new List<ApplicationRequirement>();
    public ICollection<FormSubmission> FormSubmissions { get; set; } = new List<FormSubmission>();
    
    public ICollection<StatementOfAccount> StatementsOfAccount { get; set; } = new List<StatementOfAccount>();
    public ICollection<OrderOfPayment> OrdersOfPayment { get; set; } = new List<OrderOfPayment>();
    public ICollection<ApplicationHistory> Histories { get; set; } = new List<ApplicationHistory>();
    public ICollection<CorrectionAuditTrail> CorrectionAuditTrails { get; set; } = new List<CorrectionAuditTrail>();
}
