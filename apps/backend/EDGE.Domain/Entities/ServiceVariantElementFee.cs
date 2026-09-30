using System;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ServiceVariantElementFee : AuditableEntity
{
    public Guid ServiceVariantId { get; set; }
    public virtual ServiceVariant? ServiceVariant { get; set; }
    public Guid ElementId { get; set; }
    public virtual Element? Element { get; set; }
    public Guid FeeId { get; set; }
    public virtual Fee? Fee { get; set; }
    public decimal Amount { get; set; }

    public FeeCalculationMode CalculationMode { get; set; } = FeeCalculationMode.StandardMultiplier;
    public string? CalculationFormula { get; set; }

    public bool MultiplyByValidityYears { get; set; } = true;
    public bool MultiplyByUnits { get; set; } = true;
    public bool MultiplyByChannels { get; set; } = false;
    public bool MultiplyByPages { get; set; } = false;

    public bool ApplyLateRenewalSurcharge { get; set; } = true;
    public bool IncludeDst { get; set; } = true;
    public decimal DstAmount { get; set; } = 30.00m;

    public int SortOrder { get; set; } = 1;
    public bool IsActive { get; set; } = true;
}
