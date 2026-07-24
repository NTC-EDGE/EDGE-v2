using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-11 (Application for Construction Permit).
/// </summary>
public static class Ntc111Fields
{
    public static class PermitSubtype
    {
        public static readonly PdfField ConstructionPermit = new("PermitSubtype.ConstructionPermit", 88.22, 275.65);
        public static readonly PdfField RadioStationLicense = new("PermitSubtype.RadioStationLicense", 88.22, 290.67);
    }

    public static class TypeOfApplication
    {
        public static readonly PdfField New = new("TypeOfApplication.New", 88.22, 208.45);
        public static readonly PdfField Renewal = new("TypeOfApplication.Renewal", 88.22, 223.45);
        public static readonly PdfField Modification = new("TypeOfApplication.Modification", 88.22, 238.45);
        public static readonly PdfField ModificationReason = new("TypeOfApplication.Reason", 102.0, 256.0, FontSize: 8.0);
    }

    public static class TypeOfRadioService
    {
        public static readonly PdfField FixedAndLandMobile = new("RadioService.FixedLandMobile", 282.90, 208.45);
        public static readonly PdfField Aeronautical = new("RadioService.Aeronautical", 282.90, 223.45);
        public static readonly PdfField MaritimePublicPrivateCoastal = new("RadioService.Maritime", 282.90, 238.45);
        public static readonly PdfField Broadcast = new("RadioService.Broadcast", 443.95, 208.45);
        public static readonly PdfField Other = new("RadioService.Other", 443.95, 223.45);
    }

    public static class NatureOfService
    {
        public static readonly PdfField NoOfYears = new(
            "NatureOfService.NoOfYears",
            X: 157.25,
            Y: 305.67,
            Width: 23.2,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField CvPrivate = new("NatureOfService.CvPrivate", 88.22, 335.68);
        public static readonly PdfField CoGovernment = new("NatureOfService.CoGovernment", 88.22, 350.68);
        public static readonly PdfField CpPublicCorrespondence = new("NatureOfService.CpPublicCorrespondence", 88.22, 365.68);
    }

    public static class ClassOfStation
    {
        public static readonly PdfField RT = new("ClassOfStation.RT", 282.90, 320.67);
        public static readonly PdfField ML = new("ClassOfStation.ML", 351.93, 320.67);
        public static readonly PdfField FC = new("ClassOfStation.FC", 420.95, 320.67);
        public static readonly PdfField TC = new("ClassOfStation.TC", 489.98, 320.67);

        public static readonly PdfField FX = new("ClassOfStation.FX", 282.90, 335.68);
        public static readonly PdfField P = new("ClassOfStation.P", 351.93, 335.68);
        public static readonly PdfField FA = new("ClassOfStation.FA", 420.95, 335.68);

        public static readonly PdfField FB = new("ClassOfStation.FB", 282.90, 350.68);
        public static readonly PdfField BC = new("ClassOfStation.BC", 351.93, 350.68);
        public static readonly PdfField MA = new("ClassOfStation.MA", 420.95, 350.68);

        public static readonly PdfField Other = new("ClassOfStation.Other", 505.0, 355.0, FontSize: 8.0);
    }

    public static class Applicant
    {
        public static readonly PdfField Name = new("Applicant.Name", 126.0, 404.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 126.0, 419.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 413.0, 419.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 126.0, 434.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 413.0, 434.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 126.0, 449.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 413.0, 449.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 126.0, 464.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 413.0, 464.0, FontSize: 8.0);
    }

    public static class ProposedStation
    {
        public static readonly PdfField ExactLocation = new("ProposedStation.ExactLocation", 126.0, 509.0, FontSize: 8.0);
        public static readonly PdfField MakeModel = new("ProposedStation.MakeModel", 436.0, 509.0, FontSize: 8.0);

        public static readonly PdfField Longitude = new("ProposedStation.Longitude", 126.0, 524.0, FontSize: 8.0);
        public static readonly PdfField Latitude = new("ProposedStation.Latitude", 275.0, 524.0, FontSize: 8.0);
        public static readonly PdfField SerialNumber = new("ProposedStation.SerialNumber", 436.0, 524.0, FontSize: 8.0);

        public static readonly PdfField PointsOfCommServiceArea = new("ProposedStation.PointsOfComm", 126.0, 544.0, FontSize: 8.0);
        public static readonly PdfField PowerOutput = new("ProposedStation.PowerOutput", 436.0, 539.0, FontSize: 8.0);
        public static readonly PdfField FrequencyRange = new("ProposedStation.FrequencyRange", 436.0, 554.0, FontSize: 8.0);

        public static readonly PdfField AssignedFreq = new("ProposedStation.AssignedFreq", 126.0, 569.0, FontSize: 8.0);

        public static readonly PdfField BwEmission = new("ProposedStation.BwEmission", 126.0, 584.0, FontSize: 8.0);
        public static readonly PdfField AntennaType = new("ProposedStation.AntennaType", 390.0, 584.0, FontSize: 8.0);

        public static readonly PdfField Configuration = new("ProposedStation.Configuration", 126.0, 599.0, FontSize: 8.0);
        public static readonly PdfField AntennaHeightM = new("ProposedStation.AntennaHeightM", 390.0, 599.0, FontSize: 8.0);
        public static readonly PdfField AntennaGainDbi = new("ProposedStation.AntennaGainDbi", 505.0, 599.0, FontSize: 8.0);

        public static readonly PdfField DataRate = new("ProposedStation.DataRate", 126.0, 614.0, FontSize: 8.0);
        public static readonly PdfField CallSign = new("ProposedStation.CallSign", 275.0, 614.0, FontSize: 8.0);
        public static readonly PdfField AntennaDirectivity = new("ProposedStation.AntennaDirectivity", 390.0, 614.0, FontSize: 8.0);

        public static readonly PdfField RslNo = new("ProposedStation.RslNo", 126.0, 629.0, FontSize: 8.0);
        public static readonly PdfField AntennaPolarization = new("ProposedStation.AntennaPolarization", 390.0, 629.0, FontSize: 8.0);

        public static readonly PdfField Validity = new("ProposedStation.Validity", 126.0, 644.0, FontSize: 8.0);
        public static readonly PdfField AntennaBeamwidth = new("ProposedStation.AntennaBeamwidth", 390.0, 644.0, FontSize: 8.0);

        public static readonly PdfField Notes = new("ProposedStation.Notes", 126.0, 659.0, FontSize: 8.0);
        public static readonly PdfField AntennaDiameter = new("ProposedStation.AntennaDiameter", 460.0, 659.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 208.56,
            Y: 743.0,
            Width: 309.92,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 208.57,
            Y: 785.0,
            Width: 125.85,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 464.0, 732.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 464.0, 741.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 508.0, 741.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 444.0, 752.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 464.0,
            Y: 765.0,
            Width: 120.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
