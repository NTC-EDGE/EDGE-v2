using System;

namespace EDGE.Infrastructure.Printing.Models;

public enum NatureOfService114
{
    CV, // Private
    CO, // Government
    CP, // Public Correspondence
    Others
}

public enum TypeOfRadioService114
{
    FixedAndLandMobile,
    Aeronautical,
    Broadcast,
    Others
}

/// <summary>
/// NTC 1-14 — Application for Temporary Permit to Propagate/Demonstrate.
/// Revision No. 02 (03/31/2023).
/// </summary>
public class Ntc114Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);

    public NatureOfService114 NatureOfService { get; set; } = NatureOfService114.CV;
    public string? NatureOfServiceOther { get; set; }

    public TypeOfRadioService114 TypeOfRadioService { get; set; } = TypeOfRadioService114.FixedAndLandMobile;
    public string? TypeOfRadioServiceOther { get; set; }

    public ClassOfStation ClassOfStation { get; set; } = new();

    public Applicant Applicant { get; set; } = new();
    public Station ProposedStation { get; set; } = new();
    public Equipment Equipment { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
