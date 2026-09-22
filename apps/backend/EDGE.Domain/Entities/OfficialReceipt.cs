using System;
using System.Collections.Generic;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

/// <summary>
/// Represents an issued Government Official Receipt (Accountable Form No. 51).
/// </summary>
public class OfficialReceipt : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string OfficialReceiptNumber { get; set; } = string.Empty;

    public Guid? BookletId { get; set; }
    public OrBooklet? Booklet { get; set; }

    public Guid? OrderOfPaymentId { get; set; }
    public OrderOfPayment? OrderOfPayment { get; set; }

    public Guid? ApplicationId { get; set; }
    public Application? Application { get; set; }

    public string PayorName { get; set; } = string.Empty;
    public string? PayorAddress { get; set; }
    public decimal Amount { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? CheckNumber { get; set; }
    public string? CheckBank { get; set; }
    public DateTime? CheckDate { get; set; }

    public Guid? DepositId { get; set; }
    public BankDeposit? Deposit { get; set; }

    public ReceiptStatus Status { get; set; } = ReceiptStatus.Issued;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public Guid? IssuedByUserId { get; set; }
    public User? IssuedByUser { get; set; }

    public DateTime? CancelledAt { get; set; }
    public Guid? CancelledByUserId { get; set; }
    public User? CancelledByUser { get; set; }
    public string? CancellationReason { get; set; }

    public string? Remarks { get; set; }

    public ICollection<OfficialReceiptLineItem> LineItems { get; set; } = new List<OfficialReceiptLineItem>();
}
