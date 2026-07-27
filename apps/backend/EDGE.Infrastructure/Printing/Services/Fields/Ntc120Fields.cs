using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-20 (Application for VAS Registration).
/// </summary>
public static class Ntc120Fields
{
    public static class TypeOfApplication
    {
        private const double CheckColumnX = 67;

        // Column 1 Checkboxes
        public static readonly PdfField New =
            new(
                "TypeOfApplication.New",
                CheckColumnX,
                210.0,
                Anchor: PdfAnchor.Center);

        public static readonly PdfField Renewal =
            new(
                "TypeOfApplication.Renewal",
                CheckColumnX,
                225,
                Anchor: PdfAnchor.Center);

        public static readonly PdfField Modification =
            new(
                "TypeOfApplication.Modification",
                CheckColumnX,
                240.0,
                Anchor: PdfAnchor.Center);

        // Supporting text
        public static readonly PdfField ModificationReason =
            new(
                "TypeOfApplication.ModificationReason",
                82.0,
                255.0,
                Width: 115.0,
                Height: 15.0,
                HorizontalAlignment: HorizontalAlignment.Left,
                Anchor: PdfAnchor.BaselineLeft,
                FontSize: 7.5);
    }

    public static class RegistrationCategory
    {
        private const double CheckColumn1X = 250;
        private const double CheckColumn2X = 274;

        public static readonly PdfField VasProvider =
            new(
                "RegistrationCategory.VasProvider",
                CheckColumn1X,
                210,
                Anchor: PdfAnchor.Center);

        public static readonly PdfField PcsotspProvider =
            new(
                "RegistrationCategory.PcsotspProvider",
                CheckColumn1X,
                225.0,
                Anchor: PdfAnchor.Center);

        public static readonly PdfField VoipProviderOrReseller =
            new(
                "RegistrationCategory.VoipProviderOrReseller",
                CheckColumn1X,
                255.0,
                Anchor: PdfAnchor.Center);

        public static readonly PdfField VoipProvider =
            new(
                "RegistrationCategory.VoipProvider",
                CheckColumn2X,
                270.0,
                Anchor: PdfAnchor.Center);
        
        public static readonly PdfField VoipReseller =
            new(
                "RegistrationCategory.VoipReseller",
                CheckColumn2X,
                285.0,
                Anchor: PdfAnchor.Center);
    }

    public static class Applicant
    {
        public static readonly PdfField Name = new("Applicant.Name", 107.0, 323, Width: 450, Height: 15, FontSize: 8.0, IsBold: true);
        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 152.0, 338.0, FontSize: 7.5, Width: 180, Height: 15);
        public static readonly PdfField Street = new("Applicant.Street", 405.0, 338.0, Width: 170, Height: 15, FontSize: 7.5);
        public static readonly PdfField Barangay = new("Applicant.Barangay", 152.0, 353.0, Width: 180, Height: 15, FontSize: 7.5);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 405.0, 353.0, Width: 170, Height: 15, FontSize: 7.5);
        public static readonly PdfField Province = new("Applicant.Province", 152.0, 368.0, Width: 180, Height: 15, FontSize: 7.5);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 405.0, 368.0, Width: 170, Height: 15, FontSize: 7.5);
        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 152.0, 383.0, Width: 180, Height: 15, FontSize: 7.5);
        public static readonly PdfField Email = new("Applicant.Email", 405.0, 383.0, Width: 170, Height: 15, FontSize: 7.5);
    }

    public static class EntityType
    {
        public static readonly PdfField Corporation = new("EntityType.Corporation", 112, 398.0, Anchor: PdfAnchor.Center);
        public static readonly PdfField SingleProprietorship = new("EntityType.SingleProprietorship", 112, 413.0, Anchor: PdfAnchor.Center);
        public static readonly PdfField Partnership = new("EntityType.Partnership", 340, 398.0);
        public static readonly PdfField Other = new("EntityType.Other", 340, 413.0);
        public static readonly PdfField OtherSpecify = new("EntityType.OtherSpecify", 430.0, 413, Width: 140, Height: 15, FontSize: 7.5);
    }

    public static class Permits
    {
        public static readonly PdfField CpcnPaCaNo = new("Permits.CpcnPaCaNo", 152.0, 428.0, Width: 130, Height: 15, FontSize: 7.5);
        public static readonly PdfField CpcnPaCaValidity = new("Permits.CpcnPaCaValidity", 475.0, 428.0, Width: 130, Height: 15, FontSize: 7.5);
        public static readonly PdfField CorNo = new("Permits.CorNo", 152.0, 439.0, Width: 100, Height: 15, FontSize: 7.5);
        public static readonly PdfField CorValidity = new("Permits.CorValidity", 475.0, 439.0, Width: 100, Height: 15, FontSize: 7.5);
    }

    public static class FormerName
    {
        public static readonly PdfField IsKnownYes = new("FormerName.IsKnownYes", 67, 473.0, Anchor: PdfAnchor.Center);
        public static readonly PdfField FormerNameValue = new("FormerName.Value", 222.0, 473.0, Width: 100, Height: 15, FontSize: 7.5);
        public static readonly PdfField IsKnownNo = new("FormerName.IsKnownNo", 67, 488.0);
    }

    public static class VasServices
    {
        private const double CheckColumn1X = 43;

        public static readonly PdfField MessagingService = new("VasServices.MessagingService", CheckColumn1X, 525.0);
        public static readonly PdfField AudioConferencing = new("VasServices.AudioConferencing", CheckColumn1X, 540.0);
        public static readonly PdfField AudioAndVideoConferencing = new("VasServices.AudioAndVideoConferencing", CheckColumn1X, 555.0);
        public static readonly PdfField VoiceMailService = new("VasServices.VoiceMailService", CheckColumn1X, 570.0);
        public static readonly PdfField ElectronicMailService = new("VasServices.ElectronicMailService", CheckColumn1X, 585.0);
        public static readonly PdfField InformationService = new("VasServices.InformationService", CheckColumn1X, 600.0);
        public static readonly PdfField ApplicationService = new("VasServices.ApplicationService", CheckColumn1X, 615.0);

        private const double CheckColumn2X = 273;

        public static readonly PdfField ContentAndProgramService = new("VasServices.ContentAndProgramService", CheckColumn2X, 525.0);
        public static readonly PdfField AudiotextService = new("VasServices.AudiotextService", CheckColumn2X, 540.0);
        public static readonly PdfField FacsimileService = new("VasServices.FacsimileService", CheckColumn2X, 555.0);
        public static readonly PdfField VirtualPrivateNetworkService = new("VasServices.VirtualPrivateNetworkService", CheckColumn2X, 570.0);
        public static readonly PdfField HostingService = new("VasServices.HostingService", CheckColumn2X, 585.0);
        public static readonly PdfField ElectronicGamingServices = new("VasServices.ElectronicGamingServices", CheckColumn2X, 600.0);
        public static readonly PdfField Others = new("VasServices.Others", CheckColumn2X, 615.0);
        public static readonly PdfField OthersSpecify = new("VasServices.OthersSpecify", 290.0, 630.0, FontSize: 7.5);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 208,
            Y: 742.0,
            Width: 253.3,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            TextTransform: TextTransform.Uppercase,
            FontSize: 9.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 208,
            Y: 783.0,
            Width: 253.3,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 460.0, 735.0, FontSize: 7.5);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 470.0, 747, FontSize: 7.5);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 520.0, 747, FontSize: 7.5);
        public static readonly PdfField Amount = new("Payment.Amount", 483.0, 758.0, FontSize: 7.5, Anchor: PdfAnchor.BaselineCenter);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 468.0,
            Y: 775,
            Width: 100.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 7.5);
    }
}
