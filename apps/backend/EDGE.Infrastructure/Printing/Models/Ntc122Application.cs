using System;

namespace EDGE.Infrastructure.Printing.Models;

public enum TypeOfLicenseCert122
{
    TvroRegistrationCert,
    TvroStationLicense,
    CatvStationLicense
}

public enum ClassificationOfApplicant122
{
    CommercialBroadcasting,
    NonCommercial,
    Catv,
    Others
}

public class TvroEquipmentDetails
{
    public string MakeTypeModel { get; set; } = "";
    public string SerialNumber { get; set; } = "";
    public string FrequencyRange { get; set; } = "";
}

public class AntennaSystemDetails
{
    public string DishDiameter { get; set; } = "";
    public string Polarization { get; set; } = "";
    public string Azimuth { get; set; } = "";
}

public class SignalToBeReceivedDetails
{
    public string Satellite { get; set; } = "";
    public string Polarization { get; set; } = "";
    public string ReceivedFrequency { get; set; } = "";
    public string NameOfPrograms { get; set; } = "";
}

/// <summary>
/// NTC 1-22 — Application for TVRO Registration Certificate / TVRO Station License / CATV Station License.
/// Revision No. 02 (03/31/2023).
/// </summary>
public class Ntc122Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);

    public TypeOfApplication TypeOfApplication { get; set; } = TypeOfApplication.New;
    public TypeOfLicenseCert122 TypeOfLicenseCert { get; set; } = TypeOfLicenseCert122.TvroRegistrationCert;

    public ClassificationOfApplicant122 ClassificationOfApplicant { get; set; } = ClassificationOfApplicant122.CommercialBroadcasting;
    public string? ClassificationOthersDetails { get; set; }
    public int? NoOfYears { get; set; }

    public Applicant Applicant { get; set; } = new();

    public string PaCaNo { get; set; } = "";
    public DateOnly Validity { get; set; }
    public string ServiceArea { get; set; } = "";
    public Station ProposedStation { get; set; } = new();

    public TvroEquipmentDetails Equipment { get; set; } = new();
    public AntennaSystemDetails AntennaSystem { get; set; } = new();
    public SignalToBeReceivedDetails SignalToBeReceived { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
