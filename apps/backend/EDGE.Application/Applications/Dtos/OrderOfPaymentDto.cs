using System;
using System.Collections.Generic;

namespace EDGE.Application.Applications.Dtos;

public class OrderOfPaymentDto
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Guid StatementOfAccountId { get; set; }
    public string OpNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal AmountDue { get; set; }
    public decimal AmountReceived { get; set; }
    public string? PaymentMethod { get; set; }
    public string? OfficialReceiptNumber { get; set; }
    public string? CheckNumber { get; set; }
    public string? CheckName { get; set; }
    public string? CheckBank { get; set; }
    public DateTime? CheckDate { get; set; }
    public Guid? VerifiedByCashierId { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Remarks { get; set; }
    public List<OpHistoryDto> Histories { get; set; } = new();
}

public class OpHistoryDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? FromStatus { get; set; }
    public string ToStatus { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public string StaffRole { get; set; } = string.Empty;
    public string? OfficialReceiptNumber { get; set; }
    public string? Remarks { get; set; }
    public DateTime Timestamp { get; set; }
}
