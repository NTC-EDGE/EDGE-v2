using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-21 (Application for Duplicate of Permit/License/Certificate).
/// </summary>
public static class Ntc121Fields
{
    public static class Applicant
    {
        public static readonly PdfField LastName = new("Applicant.LastName", 145.0, 250.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField FirstName = new("Applicant.FirstName", 145.0, 265.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField MiddleName = new("Applicant.MiddleName", 423.0, 265.0, FontSize: 8.0, IsBold: true);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 145.0, 280.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 423.0, 280.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 145.0, 295.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 423.0, 295.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 145.0, 310.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 423.0, 310.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 168.0, 340.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 423.0, 340.0, FontSize: 8.0);
    }

    public static readonly PdfField CircumstancesOfLossMutilation = new("CircumstancesOfLossMutilation", 30.0, 375.0, FontSize: 8.0);

    public static class PermitLicenseCert
    {
        public static readonly PdfField Type = new("PermitLicenseCert.Type", 55.0, 540.0, FontSize: 8.0);
        public static readonly PdfField Number = new("PermitLicenseCert.Number", 160.0, 540.0, FontSize: 8.0);
        public static readonly PdfField Validity = new("PermitLicenseCert.Validity", 355.0, 540.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 201.0,
            Y: 585.0,
            Width: 162.2,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 201.0,
            Y: 630.0,
            Width: 162.2,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 455.0, 570.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 460.0, 582.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 520.0, 582.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 445.0, 595.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 475.0,
            Y: 615.0,
            Width: 110.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
