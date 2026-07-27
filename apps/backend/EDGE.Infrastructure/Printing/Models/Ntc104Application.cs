using System;
using System.Collections.Generic;

namespace EDGE.Infrastructure.Printing.Models;

public enum TypeOfPermitLicenseCert104
{
    ShipStationLicense,
    ShipEarthStationLicense,
    CargoShipSafetyRadioCertificate,
    TemporaryPermit,
    FerryingPermit
}

public enum VesselCategory
{
    Ship,
    Aircraft,
    Others
}

public enum TradingRoute
{
    Domestic,
    International
}

public class ShipDetails
{
    public string NameOfShipVessel { get; set; } = "";
    public string CallSign { get; set; } = "";
    public string MmsiNo { get; set; } = "";
    public string StationLicenseNo { get; set; } = "";
    public string ImoNo { get; set; } = "";
    public DateOnly Validity { get; set; }
}

public class RadioOperatorDetails
{
    public string Name { get; set; } = "";
    public string CertificateNumber { get; set; } = "";
    public DateOnly Validity { get; set; }
}

/// <summary>
/// NTC 1-04 — Application for Permit/License/Certificate (Maritime/Ship Radio Station).
/// See JSON contract section 4.3 in FastTrackSeeder.
/// </summary>
public class Ntc104Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);
    public TypeOfApplication TypeOfApplication { get; set; }
    public string? ModificationReason { get; set; }
    public int? NoOfYears { get; set; }

    public TypeOfPermitLicenseCert104 TypeOfPermitLicenseCert { get; set; }
    public VesselCategory VesselCategory { get; set; } = VesselCategory.Ship;
    public string? OtherVesselCategoryDetails { get; set; }
    public TradingRoute TradingRoute { get; set; } = TradingRoute.Domestic;

    public Applicant Applicant { get; set; } = new();
    public ShipDetails ShipDetails { get; set; } = new();

    public List<Equipment> Equipment { get; set; } = new();
    public List<RadioOperatorDetails> Operators { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
