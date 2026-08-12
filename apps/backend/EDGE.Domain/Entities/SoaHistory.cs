using System;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class SoaHistory : BaseEntity
{
    public Guid StatementOfAccountId { get; set; }
    public StatementOfAccount StatementOfAccount { get; set; } = null!;
    public string Action { get; set; } = string.Empty;
    public SoaStatus? FromStatus { get; set; }
    public SoaStatus ToStatus { get; set; }
    public Guid PerformedByUserId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string StaffRole { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
