using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-18 (Permits/Licenses Commercial RCE & Mobile Phone).
/// </summary>
public static class Ntc118Fields
{
    public static class TypeOfApplication
    {
        public static readonly PdfField New = new("TypeOfApplication.New", 87.3, 249.4);
        public static readonly PdfField Renewal = new("TypeOfApplication.Renewal", 87.3, 264.4);
        public static readonly PdfField Modification = new("TypeOfApplication.Modification", 87.3, 279.4);
        public static readonly PdfField ModificationReason = new("TypeOfApplication.Reason", 101.0, 299.8, FontSize: 7.5);
    }

    public static class PermitCategory
    {
        public static readonly PdfField RceCategory = new("PermitCategory.RceCategory", 295.4, 249.4);
        public static readonly PdfField RceDealer = new("PermitCategory.RceDealer", 318.4, 264.4);
        public static readonly PdfField RceDealerTransceiver = new("PermitCategory.RceDealerTransceiver", 341.4, 279.4);
        public static readonly PdfField RceDealerWdnIndoorSrdRfid = new("PermitCategory.RceDealerWdn", 341.4, 294.4);
        public static readonly PdfField RceManufacturer = new("PermitCategory.RceManufacturer", 318.4, 309.4);
        public static readonly PdfField RceServiceCenter = new("PermitCategory.RceServiceCenter", 318.4, 324.4);

        public static readonly PdfField MobilePhoneCategory = new("PermitCategory.MobilePhoneCategory", 295.4, 339.4);
        public static readonly PdfField MpDealer = new("PermitCategory.MpDealer", 318.4, 354.4);
        public static readonly PdfField MpRetailerReseller = new("PermitCategory.MpRetailerReseller", 318.4, 369.4);
        public static readonly PdfField MpServiceCenter = new("PermitCategory.MpServiceCenter", 318.4, 384.4);

        public static readonly PdfField CpeSupplierAccreditation = new("PermitCategory.CpeSupplierAccreditation", 295.4, 399.4);
    }

    public static class Applicant
    {
        public const double ApplicantCol1X = 108;
        public const double ApplicantCol2X = 125;
        public const double ApplicantCol3X = 380;
        public static readonly PdfField Name = new("Applicant.Name", ApplicantCol1X, 440.0, FontSize: 8.0, IsBold: true);

        public static readonly PdfField Corporation = new("Applicant.Corporation", ApplicantCol1X, 470.0);
        public static readonly PdfField SingleProprietorship = new("Applicant.SingleProprietorship", ApplicantCol1X, 485.0);
        public static readonly PdfField Partnership = new("Applicant.Partnership", 315.0, 470.0);
        public static readonly PdfField OtherEntity = new("Applicant.OtherEntity", 315.0, 485.0);
        public static readonly PdfField EntityTypeOther = new("Applicant.EntityTypeOther", 402.0, 485.0, FontSize: 7.5);

        public static readonly PdfField ExistingPermitNo = new("Applicant.ExistingPermitNo", ApplicantCol1X, 500.0, FontSize: 7.5);
        public static readonly PdfField ExistingPermitValidity = new("Applicant.ExistingPermitValidity", ApplicantCol3X, 500.0, FontSize: 7.5);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", ApplicantCol2X, 515.0, FontSize: 7.5);
        public static readonly PdfField Street = new("Applicant.Street", ApplicantCol3X, 515.0, FontSize: 7.5);

        public static readonly PdfField Barangay = new("Applicant.Barangay", ApplicantCol2X, 530.0, FontSize: 7.5);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", ApplicantCol3X, 530.0, FontSize: 7.5);

        public static readonly PdfField Province = new("Applicant.Province", ApplicantCol2X, 545.0, FontSize: 7.5);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", ApplicantCol3X, 545.0, FontSize: 7.5);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", ApplicantCol2X, 560.0, FontSize: 7.5);
        public static readonly PdfField Email = new("Applicant.Email", ApplicantCol3X, 560.0, FontSize: 7.5);
    }

    public static class Personnel
    {
        public const double PersonnelCol1X = 125;
        public const double PersonnelCol2X = 425;
        public static readonly PdfField EngineerName = new("Personnel.EngineerName", PersonnelCol1X, 605.0, FontSize: 7.5);
        public static readonly PdfField EngineerLicenseNo = new("Personnel.EngineerLicenseNo", PersonnelCol1X, 620.0, FontSize: 7.5);
        public static readonly PdfField EngineerValidity = new("Personnel.EngineerValidity", PersonnelCol1X, 636.0, FontSize: 7.5);

        public static readonly PdfField TechName = new("Personnel.TechName", PersonnelCol2X, 605.0, FontSize: 7.5);
        public static readonly PdfField TechLicenseNo = new("Personnel.TechLicenseNo", PersonnelCol2X, 620.0, FontSize: 7.5);
        public static readonly PdfField TechValidity = new("Personnel.TechValidity", PersonnelCol2X, 636.0, FontSize: 7.5);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 191.85,
            Y: 738.0,
            Width: 230.1,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 191.85,
            Y: 780.0,
            Width: 230.1,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 460.0, 718.0, FontSize: 7.5);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 460.0, 728.0, FontSize: 7.5);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 515.0, 728.0, FontSize: 7.5);
        public static readonly PdfField Amount = new("Payment.Amount", 432.0, 738.0, FontSize: 7.5);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 470.0,
            Y: 758.0,
            Width: 130.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 7.5);
    }
}
