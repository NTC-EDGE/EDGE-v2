using System;
using System.Collections.Generic;

namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// NTC 1-05 — Form A (Multiple Stations / Equipment Attachment Sheet).
/// </summary>
public class Ntc105Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2025, 3, 31);

    public string ApplicantName { get; set; } = "";
    public List<Equipment> Equipment { get; set; } = new();
    public Declaration Declaration { get; set; } = new();
}
