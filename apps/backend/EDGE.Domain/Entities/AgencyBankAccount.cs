using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

/// <summary>
/// Represents an authorized Government Depositary Bank Account (e.g., Land Bank of the Philippines, DBP).
/// </summary>
public class AgencyBankAccount : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string BankName { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string? Branch { get; set; }
    public string FundCluster { get; set; } = "01 - Regular Agency Fund";
    public bool IsActive { get; set; } = true;
    public string? Remarks { get; set; }

    public ICollection<BankDeposit> Deposits { get; set; } = new List<BankDeposit>();
}
