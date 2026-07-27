using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-22 (Application for TVRO / CATV Station License / Registration).
/// </summary>
public static class Ntc122Fields
{
    public static class TypeOfApplication
    {
        public static readonly PdfField New = new("TypeOfApplication.New", 82.1, 230.4);
        public static readonly PdfField Renewal = new("TypeOfApplication.Renewal", 82.1, 245.4);
    }

    public static class TypeOfLicenseCert
    {
        public static readonly PdfField TvroRegistrationCert = new("TypeOfLicense.TvroRegistrationCert", 255.8, 230.4);
        public static readonly PdfField TvroStationLicense = new("TypeOfLicense.TvroStationLicense", 255.8, 245.4);
        public static readonly PdfField CatvStationLicense = new("TypeOfLicense.CatvStationLicense", 255.8, 260.4);
    }

    public static class ClassificationOfApplicant
    {
        public static readonly PdfField CommercialBroadcasting = new("Classification.CommercialBroadcasting", 82.1, 316.2);
        public static readonly PdfField NonCommercial = new("Classification.NonCommercial", 82.1, 331.2);
        public static readonly PdfField Catv = new("Classification.Catv", 255.8, 316.2);
        public static readonly PdfField Others = new("Classification.Others", 255.8, 331.2);
        public static readonly PdfField OthersDetails = new("Classification.OthersDetails", 338.0, 347.0, FontSize: 8.0);
        public static readonly PdfField NoOfYears = new(
            "Classification.NoOfYears",
            X: 512.7,
            Y: 301.2,
            Width: 24.4,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);
    }

    public static class Applicant
    {
        public static readonly PdfField Name = new("Applicant.Name", 122.0, 384.0, FontSize: 8.0, IsBold: true);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 122.0, 399.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 390.0, 399.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 122.0, 414.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 390.0, 414.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 122.0, 429.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 390.0, 429.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 122.0, 444.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 390.0, 444.0, FontSize: 8.0);

        public static readonly PdfField PaCaNo = new("Applicant.PaCaNo", 122.0, 459.0, FontSize: 8.0);
        public static readonly PdfField Validity = new("Applicant.Validity", 390.0, 459.0, FontSize: 8.0);

        public static readonly PdfField ServiceArea = new("Applicant.ServiceArea", 122.0, 474.0, FontSize: 8.0);

        public static readonly PdfField ExactLocation = new("Applicant.ExactLocation", 122.0, 489.0, FontSize: 8.0);
        public static readonly PdfField Longitude = new("Applicant.Longitude", 240.0, 489.0, FontSize: 8.0);
        public static readonly PdfField Latitude = new("Applicant.Latitude", 460.0, 489.0, FontSize: 8.0);
    }

    public static class Equipment
    {
        public static readonly PdfField MakeTypeModel = new("Equipment.MakeTypeModel", 122.0, 546.0, FontSize: 8.0);
        public static readonly PdfField SerialNumber = new("Equipment.SerialNumber", 122.0, 561.0, FontSize: 8.0);
        public static readonly PdfField FrequencyRange = new("Equipment.FrequencyRange", 122.0, 576.0, FontSize: 8.0);
    }

    public static class AntennaSystem
    {
        public static readonly PdfField DishDiameter = new("AntennaSystem.DishDiameter", 122.0, 621.0, FontSize: 8.0);
        public static readonly PdfField Polarization = new("AntennaSystem.Polarization", 390.0, 606.0, FontSize: 8.0);
        public static readonly PdfField Azimuth = new("AntennaSystem.Azimuth", 390.0, 621.0, FontSize: 8.0);
    }

    public static class SignalToBeReceived
    {
        public static readonly PdfField Satellite = new("Signal.Satellite", 122.0, 651.0, FontSize: 8.0);
        public static readonly PdfField Polarization = new("Signal.Polarization", 390.0, 651.0, FontSize: 8.0);
        public static readonly PdfField ReceivedFrequency = new("Signal.ReceivedFrequency", 122.0, 666.0, FontSize: 8.0);
        public static readonly PdfField NameOfPrograms = new("Signal.NameOfPrograms", 390.0, 666.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 191.6,
            Y: 761.0,
            Width: 171.6,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 194.2,
            Y: 804.0,
            Width: 78.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 455.0, 730.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 460.0, 742.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 520.0, 742.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 445.0, 755.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 475.0,
            Y: 775.0,
            Width: 110.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
