using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ServiceFormula : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public virtual Service? Service { get; set; }

    public string FormulaExpression { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
