using System;
using System.Collections.Generic;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class OrderOfPayment : AuditableEntity
{
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;
    public Guid StatementOfAccountId { get; set; }
    public StatementOfAccount StatementOfAccount { get; set; } = null!;
    public string OpNumber { get; set; } = string.Empty;
    public OpStatus Status { get; set; } = OpStatus.Billed;
    public decimal AmountDue { get; set; }
    public decimal AmountReceived { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public string? OfficialReceiptNumber { get; set; }
    public string? CheckNumber { get; set; }
    public string? CheckName { get; set; }
    public string? CheckBank { get; set; }
    public DateTime? CheckDate { get; set; }
    public Guid? VerifiedByCashierId { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Remarks { get; set; }
    public ICollection<OpHistory> Histories { get; set; } = new List<OpHistory>();
}
