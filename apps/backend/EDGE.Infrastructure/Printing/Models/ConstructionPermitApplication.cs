namespace EDGE.Infrastructure.Printing.Models;

public enum PermitSubtype
{
    ConstructionPermit,
    RadioStationLicense
}

public enum TypeOfRadioService
{
    FixedAndLandMobile,
    Aeronautical,
    MaritimePublicPrivateCoastal,
    Broadcast,
    Amateur,
    Other
}

public enum NatureOfService
{
    CvPrivate,
    CoGovernment,
    CpPublicCorrespondence
}

/// <summary>
/// NTC 1-11 — Application for Construction Permit / Radio Station License.
/// See JSON contract section 4.5. Chosen as the reference implementation
/// because it exercises Equipment[], Stations[], and Antenna together —
/// the same pattern (inherit ApplicationBase, add form-specific fields)
/// applies to the other 7 form types.
/// </summary>
public class ConstructionPermitApplication : ApplicationBase
{
    public PermitSubtype PermitSubtype { get; set; }
    public TypeOfRadioService TypeOfRadioService { get; set; }
    public NatureOfService NatureOfService { get; set; }
    public ClassOfStation ClassOfStation { get; set; } = new();

    public ConstructionPermitApplication()
    {
        FormType = "CONSTRUCTION_PERMIT_RADIO_STATION_LICENSE";
        FormNo = "NTC 1-11";
    }
}
