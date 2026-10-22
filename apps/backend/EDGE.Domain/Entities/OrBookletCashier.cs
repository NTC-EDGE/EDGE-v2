using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

/// <summary>
/// Represents a cashier user assigned/authorized to issue Official Receipts from an Accountable Form 51 booklet.
/// Enables multi-cashier booklet sharing across shift rotations and counters.
/// </summary>
public class OrBookletCashier : AuditableEntity
{
    public Guid BookletId { get; set; }
    public virtual OrBooklet Booklet { get; set; } = null!;

    public Guid CashierUserId { get; set; }
    public virtual User CashierUser { get; set; } = null!;

    public bool IsPrimary { get; set; } = false;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
