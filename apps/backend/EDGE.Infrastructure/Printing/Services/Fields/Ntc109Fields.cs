using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-09 (Application to Purchase/Possess/Sell/Transfer Radio Equipment).
/// </summary>
public static class Ntc109Fields
{
    public static class TypeOfApplication
    {
        public static readonly PdfField Purchase = new("TypeOfApplication.Purchase", 92.42, 224.25);
        public static readonly PdfField Possess = new("TypeOfApplication.Possess", 92.42, 239.25);
        public static readonly PdfField SellTransfer = new("TypeOfApplication.SellTransfer", 92.42, 254.25);
    }

    public static class TypeOfRadioService
    {
        public static readonly PdfField FixedAndLandMobile = new("RadioService.FixedLandMobile", 276.50, 224.25);
        public static readonly PdfField Aeronautical = new("RadioService.Aeronautical", 276.50, 239.25);
        public static readonly PdfField MaritimePublicPrivateCoastal = new("RadioService.Maritime", 276.50, 254.25);
        public static readonly PdfField Broadcast = new("RadioService.Broadcast", 440.35, 224.25);
        public static readonly PdfField Amateur = new("RadioService.Amateur", 440.35, 239.25);
        public static readonly PdfField Other = new("RadioService.Other", 440.35, 254.25);
    }

    public static class NatureOfService
    {
        public static readonly PdfField CvPrivate = new("NatureOfService.CvPrivate", 92.42, 306.67);
        public static readonly PdfField CoGovernment = new("NatureOfService.CoGovernment", 92.42, 321.67);
        public static readonly PdfField CpPublicCorrespondence = new("NatureOfService.CpPublicCorrespondence", 92.42, 336.68);
    }

    public static class ClassOfStation
    {
        public static readonly PdfField RT = new("ClassOfStation.RT", 276.50, 306.67);
        public static readonly PdfField ML = new("ClassOfStation.ML", 345.53, 306.67);
        public static readonly PdfField FC = new("ClassOfStation.FC", 414.55, 306.67);
        public static readonly PdfField TC = new("ClassOfStation.TC", 489.18, 306.67);

        public static readonly PdfField FX = new("ClassOfStation.FX", 276.50, 321.67);
        public static readonly PdfField P = new("ClassOfStation.P", 345.53, 321.67);
        public static readonly PdfField FA = new("ClassOfStation.FA", 414.55, 321.67);

        public static readonly PdfField FB = new("ClassOfStation.FB", 276.50, 336.68);
        public static readonly PdfField BC = new("ClassOfStation.BC", 345.53, 336.68);
        public static readonly PdfField MA = new("ClassOfStation.MA", 414.55, 336.68);

        public static readonly PdfField Other = new("ClassOfStation.Other", 504.0, 341.0, FontSize: 8.0);
    }

    public static class Applicant
    {
        public static readonly PdfField Name = new("Applicant.Name", 153.0, 377.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField CpcCpcnPaRslNo = new("Applicant.CpcCpcnPaRslNo", 153.0, 392.0, FontSize: 8.0);
        public static readonly PdfField Validity = new("Applicant.Validity", 430.0, 392.0, FontSize: 8.0);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 153.0, 407.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 430.0, 407.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 153.0, 422.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 430.0, 422.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 153.0, 437.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 430.0, 437.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 153.0, 452.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 430.0, 452.0, FontSize: 8.0);
    }

    public static class ProposedStation
    {
        public static readonly PdfField ExactLocation = new("ProposedStation.ExactLocation", 176.0, 482.0, FontSize: 8.0);
        public static readonly PdfField MakeModel = new("ProposedStation.MakeModel", 458.0, 482.0, FontSize: 8.0);

        public static readonly PdfField Longitude = new("ProposedStation.Longitude", 176.0, 497.0, FontSize: 8.0);
        public static readonly PdfField SerialNumber = new("ProposedStation.SerialNumber", 458.0, 497.0, FontSize: 8.0);

        public static readonly PdfField Latitude = new("ProposedStation.Latitude", 176.0, 512.0, FontSize: 8.0);
        public static readonly PdfField BwEmission = new("ProposedStation.BwEmission", 458.0, 512.0, FontSize: 8.0);

        public static readonly PdfField PointsOfCommServiceArea = new("ProposedStation.PointsOfCommServiceArea", 176.0, 527.0, FontSize: 8.0);
        public static readonly PdfField PowerOutput = new("ProposedStation.PowerOutput", 458.0, 527.0, FontSize: 8.0);

        public static readonly PdfField AssignedFreq = new("ProposedStation.AssignedFreq", 176.0, 542.0, FontSize: 8.0);
        public static readonly PdfField FrequencyRange = new("ProposedStation.FrequencyRange", 458.0, 542.0, FontSize: 8.0);
    }

    public static class SourceOfEquipment
    {
        public static readonly PdfField NameOfDealer = new("SourceOfEquipment.Dealer", 153.0, 572.0, FontSize: 8.0);
        public static readonly PdfField OrInvoiceNo = new("SourceOfEquipment.OrInvoiceNo", 458.0, 572.0, FontSize: 8.0);

        public static readonly PdfField AuthorizedSellerBuyer = new("SourceOfEquipment.AuthorizedSellerBuyer", 153.0, 587.0, FontSize: 8.0);
        public static readonly PdfField PermitRslNo = new("SourceOfEquipment.PermitRslNo", 458.0, 587.0, FontSize: 8.0);
    }

    public static class IntendedUse
    {
        public static readonly PdfField NewRadioStation = new("IntendedUse.NewStation", 69.43, 615.15);
        public static readonly PdfField AdditionalEquipment = new("IntendedUse.AdditionalEquipment", 253.50, 615.15);
        public static readonly PdfField AdditionalRadioStation = new("IntendedUse.AdditionalStation", 69.43, 630.15);
        public static readonly PdfField Storage = new("IntendedUse.Storage", 253.50, 630.15);
        public static readonly PdfField ChangeOfEquipment = new("IntendedUse.ChangeEquipment", 69.43, 645.15);
        public static readonly PdfField Other = new("IntendedUse.Other", 253.50, 645.15);

        public static readonly PdfField StorageLocation = new("IntendedUse.StorageLocation", 338.0, 635.0, FontSize: 8.0);
        public static readonly PdfField OtherDetails = new("IntendedUse.OtherDetails", 338.0, 650.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 207.48,
            Y: 738.0,
            Width: 299.29,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 207.48,
            Y: 780.0,
            Width: 161.25,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 450.0, 728.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 460.0, 739.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 514.0, 739.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 435.0, 751.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 458.6,
            Y: 769.0,
            Width: 120.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
