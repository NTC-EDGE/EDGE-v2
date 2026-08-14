using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class StatementOfAccount : AuditableEntity
{
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;
    public Guid? ApplicantId { get; set; }
    public Applicant? Applicant { get; set; }
    public string SoaNumber { get; set; } = string.Empty;
    public SoaStatus Status { get; set; } = SoaStatus.Pending;
    public IssuedToType IssuedToType { get; set; } = IssuedToType.Individual;
    public string IssuedToName { get; set; } = string.Empty;
    public string? IssuedToAddress { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime DueDate { get; set; }
    public Guid? PreparedByUserId { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? Remarks { get; set; }
    public Guid? SoaNoteId { get; set; }
    public virtual SoaNote? SoaNote { get; set; }
    public ICollection<SoaLineItem> LineItems { get; set; } = new List<SoaLineItem>();
    public ICollection<SoaHistory> Histories { get; set; } = new List<SoaHistory>();
}
