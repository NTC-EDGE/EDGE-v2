using System;

namespace EDGE.Infrastructure.Printing.Models;

public enum ActionRequested124
{
    Block,
    Unblock
}

public enum IncidentType124
{
    LostMisplaced,
    Stolen,
    Others
}

public enum AgeGroup124
{
    Below18,
    Age18_29,
    Age30_39,
    Age40_49,
    Age50_59,
    Age60Up
}

public enum TimeOfDay124
{
    Daytime,
    Nighttime
}

public class ProofOfOwnershipSelection
{
    public bool CopyGovernmentId { get; set; }
    public bool CopySchoolId { get; set; }
    public bool CopyBirthCertOrNbi { get; set; }
    public bool ProofOfOwnershipReceipt { get; set; }
    public bool BoxWithImei { get; set; }
    public bool CertificateOfPurchase { get; set; }
    public bool AffidavitInAbsence { get; set; }
}

public class IncidentDetails
{
    public IncidentType124 IncidentType { get; set; } = IncidentType124.LostMisplaced;
    public Sex Sex { get; set; } = Sex.Male;
    public AgeGroup124 AgeGroup { get; set; } = AgeGroup124.Age18_29;
    public TimeOfDay124 TimeOfDay { get; set; } = TimeOfDay124.Daytime;
    public string PlaceOfIncident { get; set; } = "";
    public DateOnly DateOfIncident { get; set; }
    public string OthersSpecification { get; set; } = "";
    public DateOnly? DateOfFiling { get; set; }
    public DateOnly? DateOfRecovery { get; set; }
    public string UnblockingDetails { get; set; } = "";
}

public class NotaryPublicDetails
{
    public string SubscribedDay { get; set; } = "";
    public string SubscribedMonthYear { get; set; } = "";
    public string ResidenceCertNo { get; set; } = "";
    public string IssuedAt { get; set; } = "";
    public string IssuedDate { get; set; } = "";
    public string DocNo { get; set; } = "";
    public string PageNo { get; set; } = "";
    public string BookNo { get; set; } = "";
    public string SeriesOf { get; set; } = "";
}

/// <summary>
/// NTC 1-24 — Affidavit of Ownership and Loss with Undertaking (GSM Handset / SIM Blocking/Unblocking).
/// Revision No. 02 (03/31/2023).
/// </summary>
public class Ntc124Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);

    public ActionRequested124 ActionRequested { get; set; } = ActionRequested124.Block;

    public string AffiantName { get; set; } = "";
    public int Age { get; set; } = 25;
    public string Citizenship { get; set; } = "Filipino";
    public Address ResidentialAddress { get; set; } = new();
    public string TelephoneNumber { get; set; } = "";
    public Address OfficeAddress { get; set; } = new();
    public string OfficeTelephoneNumber { get; set; } = "";

    public string ImeiNo { get; set; } = "";
    public string MakeModelType { get; set; } = "";
    public string SimMobileNumber { get; set; } = "";

    public ProofOfOwnershipSelection ProofOfOwnership { get; set; } = new();
    public IncidentDetails Incident { get; set; } = new();

    public Declaration Declaration { get; set; } = new();
    public NotaryPublicDetails NotaryPublic { get; set; } = new();
}
