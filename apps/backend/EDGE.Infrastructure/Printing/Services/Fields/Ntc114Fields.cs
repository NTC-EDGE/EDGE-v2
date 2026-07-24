using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-14 (Application for Temporary Permit to Propagate/Demonstrate).
/// </summary>
public static class Ntc114Fields
{
    public static class NatureOfService
    {
        public static readonly PdfField CV = new("NatureOfService.CV", 83.0, 233.6);
        public static readonly PdfField CO = new("NatureOfService.CO", 83.0, 248.6);
        public static readonly PdfField CP = new("NatureOfService.CP", 83.0, 263.6);
        public static readonly PdfField Others = new("NatureOfService.Others", 129.0, 278.7);
        public static readonly PdfField OtherDetails = new("NatureOfService.OtherDetails", 145.0, 278.7, FontSize: 7.5);
    }

    public static class TypeOfRadioService
    {
        public static readonly PdfField FixedAndLandMobile = new("RadioService.FixedLandMobile", 83.0, 308.7);
        public static readonly PdfField Aeronautical = new("RadioService.Aeronautical", 83.0, 323.7);
        public static readonly PdfField Broadcast = new("RadioService.Broadcast", 83.0, 338.7);
        public static readonly PdfField Others = new("RadioService.Others", 83.0, 353.7);
        public static readonly PdfField OtherDetails = new("RadioService.OtherDetails", 101.0, 368.7, FontSize: 7.5);
    }

    public static class ClassOfStation
    {
        public static readonly PdfField RT = new("ClassOfStation.RT", 334.0, 233.6, FontSize: 8.0);
        public static readonly PdfField FX = new("ClassOfStation.FX", 334.0, 248.6, FontSize: 8.0);
        public static readonly PdfField FB = new("ClassOfStation.FB", 334.0, 263.6, FontSize: 8.0);
        public static readonly PdfField ML = new("ClassOfStation.ML", 334.0, 278.7, FontSize: 8.0);
        public static readonly PdfField P  = new("ClassOfStation.P", 334.0, 293.7, FontSize: 8.0);
        public static readonly PdfField BC = new("ClassOfStation.BC", 334.0, 308.7, FontSize: 8.0);

        public static readonly PdfField FA = new("ClassOfStation.FA", 403.0, 233.6, FontSize: 8.0);
        public static readonly PdfField MA = new("ClassOfStation.MA", 403.0, 248.6, FontSize: 8.0);
        public static readonly PdfField TC = new("ClassOfStation.TC", 403.0, 263.6, FontSize: 8.0);
        public static readonly PdfField OtherCheck = new("ClassOfStation.OtherCheck", 426.0, 278.7);
        public static readonly PdfField OtherDetails = new("ClassOfStation.OtherDetails", 423.0, 293.7, FontSize: 7.5);
    }

    public static class Applicant
    {
        public static readonly PdfField Name = new("Applicant.Name", 123.0, 413.1, FontSize: 8.0, IsBold: true);
        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 123.0, 428.1, FontSize: 7.5);
        public static readonly PdfField Street = new("Applicant.Street", 399.0, 428.1, FontSize: 7.5);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 123.0, 443.1, FontSize: 7.5);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 399.0, 443.1, FontSize: 7.5);

        public static readonly PdfField Province = new("Applicant.Province", 123.0, 458.1, FontSize: 7.5);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 399.0, 458.1, FontSize: 7.5);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 123.0, 473.1, FontSize: 7.5);
        public static readonly PdfField Email = new("Applicant.Email", 399.0, 473.1, FontSize: 7.5);
    }

    public static class ProposedStation
    {
        public static readonly PdfField ExactLocation = new("ProposedStation.ExactLocation", 123.0, 518.1, FontSize: 7.5);
        public static readonly PdfField Longitude = new("ProposedStation.Longitude", 123.0, 533.1, FontSize: 7.5);
        public static readonly PdfField Latitude = new("ProposedStation.Latitude", 123.0, 548.1, FontSize: 7.5);
        public static readonly PdfField PointsOfCommServiceArea = new("ProposedStation.PointsOfComm", 123.0, 563.1, FontSize: 7.5);
        public static readonly PdfField AssignedFreq = new("ProposedStation.AssignedFreq", 123.0, 578.2, FontSize: 7.5);
        public static readonly PdfField BwEmission = new("ProposedStation.BwEmission", 123.0, 593.2, FontSize: 7.5);
        public static readonly PdfField DataRate = new("ProposedStation.DataRate", 123.0, 608.2, FontSize: 7.5);
        public static readonly PdfField Others = new("ProposedStation.Others", 123.0, 623.2, FontSize: 7.5);
    }

    public static class Equipment
    {
        public static readonly PdfField MakeModel = new("Equipment.MakeModel", 422.0, 518.1, FontSize: 7.5);
        public static readonly PdfField SerialNumber = new("Equipment.SerialNumber", 422.0, 533.1, FontSize: 7.5);
        public static readonly PdfField PowerOutput = new("Equipment.PowerOutput", 422.0, 548.1, FontSize: 7.5);
        public static readonly PdfField FrequencyRange = new("Equipment.FrequencyRange", 422.0, 563.1, FontSize: 7.5);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 201.65,
            Y: 728.2,
            Width: 299.3,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 201.65,
            Y: 773.2,
            Width: 161.3,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 458.0, 718.0, FontSize: 7.5);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 459.0, 729.5, FontSize: 7.5);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 516.0, 729.5, FontSize: 7.5);
        public static readonly PdfField Amount = new("Payment.Amount", 432.0, 741.0, FontSize: 7.5);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 466.55,
            Y: 759.6,
            Width: 93.1,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 7.5);
    }
}
