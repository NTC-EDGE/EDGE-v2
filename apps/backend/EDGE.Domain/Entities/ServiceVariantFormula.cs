using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ServiceVariantFormula : AuditableEntity
{
    public Guid ServiceVariantId { get; set; }
    public virtual ServiceVariant? ServiceVariant { get; set; }

    public string FormulaExpression { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool ApplyLateRenewalSurcharge { get; set; } = false;
    public bool IsActive { get; set; } = true;
}
