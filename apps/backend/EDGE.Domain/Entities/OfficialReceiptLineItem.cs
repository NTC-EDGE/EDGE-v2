using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class OfficialReceiptLineItem : BaseEntity
{
    public Guid OfficialReceiptId { get; set; }
    public OfficialReceipt OfficialReceipt { get; set; } = null!;

    public string FeeCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
