using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class SoaLineItem : BaseEntity
{
    public Guid StatementOfAccountId { get; set; }
    public StatementOfAccount StatementOfAccount { get; set; } = null!;
    public string Particular { get; set; } = string.Empty;
    public string ItemCode { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? PeriodOfCoverageStart { get; set; }
    public DateTime? PeriodOfCoverageEnd { get; set; }
    public int ValidityYears { get; set; }
    public int NoOfUnits { get; set; }
    public decimal FeeRate { get; set; }
    public decimal Amount { get; set; }
}
