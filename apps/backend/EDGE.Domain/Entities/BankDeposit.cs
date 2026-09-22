using System;
using System.Collections.Generic;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

/// <summary>
/// Represents a Bank Deposit batch recording collections remitted to an authorized government depositary bank account.
/// </summary>
public class BankDeposit : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string DepositSlipNumber { get; set; } = string.Empty;

    public Guid BankAccountId { get; set; }
    public AgencyBankAccount BankAccount { get; set; } = null!;

    public DateTime DepositDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public decimal CashAmount { get; set; }
    public decimal CheckAmount { get; set; }

    public DepositStatus Status { get; set; } = DepositStatus.Deposited;

    public Guid? DepositedByUserId { get; set; }
    public User? DepositedByUser { get; set; }

    public Guid? VerifiedByUserId { get; set; }
    public User? VerifiedByUser { get; set; }

    public Guid? DepositSlipAttachmentId { get; set; }
    public StoredFile? DepositSlipAttachment { get; set; }

    public string? Remarks { get; set; }

    public ICollection<OfficialReceipt> Receipts { get; set; } = new List<OfficialReceipt>();
}
