using System;
using System.Collections.Generic;
using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

/// <summary>
/// Represents an Accountable Form 51 booklet/bundle (typically 50 pcs per bundle) registered for Official Receipt issuance.
/// </summary>
public class OrBooklet : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;

    public string BookletNumber { get; set; } = string.Empty;
    public string? Prefix { get; set; }
    public long StartNumber { get; set; }
    public long EndNumber { get; set; }
    public long CurrentNumber { get; set; }
    public int TotalCount { get; set; } = 50;
    public int IssuedCount { get; set; } = 0;

    public Guid? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }

    public BookletStatus Status { get; set; } = BookletStatus.Active;
    public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;
    public string? Remarks { get; set; }

    public ICollection<OfficialReceipt> Receipts { get; set; } = new List<OfficialReceipt>();

    public int RemainingCount => Math.Max(0, TotalCount - IssuedCount);

    public string FormatOrNumber(long number)
    {
        return string.IsNullOrWhiteSpace(Prefix)
            ? number.ToString("D7")
            : $"{Prefix.Trim()}-{number:D7}";
    }

    public string CurrentFormattedOrNumber => FormatOrNumber(CurrentNumber);
}
