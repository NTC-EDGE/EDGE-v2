using System;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class OpHistory : BaseEntity
{
    public Guid OrderOfPaymentId { get; set; }
    public OrderOfPayment OrderOfPayment { get; set; } = null!;
    public string Action { get; set; } = string.Empty;
    public OpStatus? FromStatus { get; set; }
    public OpStatus ToStatus { get; set; }
    public Guid? PerformedByUserId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string StaffRole { get; set; } = string.Empty;
    public string? OfficialReceiptNumber { get; set; }
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
