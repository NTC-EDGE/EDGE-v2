using System;
using System.Collections.Generic;

namespace EDGE.Infrastructure.Printing.Models;

public class Ntc110StationEntry
{
    public Station ProposedStation { get; set; } = new();
    public Equipment Equipment { get; set; } = new();
    public Antenna Antenna { get; set; } = new();
}

/// <summary>
/// NTC 1-10 — Form E (Multiple Stations / Equipment Attachment Sheet).
/// Supports multiple column entries across station, equipment, and antenna specs.
/// </summary>
public class Ntc110Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "01";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2021, 3, 31);

    public string ApplicantName { get; set; } = "";
    public List<Ntc110StationEntry> Entries { get; set; } = new();
    public Declaration Declaration { get; set; } = new();
}
