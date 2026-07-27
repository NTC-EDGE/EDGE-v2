using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-04 (Application for Ship Radio Station License).
/// </summary>
public static class Ntc104Fields
{
    public static class TypeOfApplication
    {
        public static readonly PdfField New = new("TypeOfApplication.New", 73.42, 217.85);
        public static readonly PdfField Renewal = new("TypeOfApplication.Renewal", 73.42, 232.85);
        public static readonly PdfField Modification = new("TypeOfApplication.Modification", 73.42, 247.85);
        public static readonly PdfField ModificationReason = new("TypeOfApplication.Reason", 89.0, 266.0, FontSize: 8.0);
        public static readonly PdfField NoOfYears = new(
            "TypeOfApplication.NoOfYears",
            X: 121.83,
            Y: 292.87,
            Width: 24.4,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);
    }

    public static class TypeOfPermitLicenseCert
    {
        public static readonly PdfField ShipStationLicense = new("TypeOfPermit.SSL", 339.71, 217.85);
        public static readonly PdfField ShipEarthStationLicense = new("TypeOfPermit.SESL", 339.71, 232.85);
        public static readonly PdfField CargoShipSafetyRadioCertificate = new("TypeOfPermit.CSSRC", 339.71, 247.85);
        public static readonly PdfField TemporaryPermit = new("TypeOfPermit.TempPermit", 339.71, 262.85);
        public static readonly PdfField FerryingPermit = new("TypeOfPermit.FerryingPermit", 339.71, 277.87);

        public static readonly PdfField VesselShip = new("VesselCategory.Ship", 363.93, 292.87);
        public static readonly PdfField VesselAircraft = new("VesselCategory.Aircraft", 478.96, 292.87);
        public static readonly PdfField VesselOthers = new("VesselCategory.Others", 339.71, 307.87);
        public static readonly PdfField OtherVesselCategoryDetails = new("VesselCategory.OtherDetails", 356.0, 326.0, FontSize: 8.0);

        public static readonly PdfField RouteDomestic = new("TradingRoute.Domestic", 218.68, 307.87);
        public static readonly PdfField RouteInternational = new("TradingRoute.International", 218.68, 322.87);
    }

    public static class Applicant
    {
        public static readonly PdfField Name = new("Applicant.Name", 114.0, 359.0, FontSize: 8.0, IsBold: true);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 114.0, 374.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 380.0, 374.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 114.0, 389.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 380.0, 388.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 114.0, 404.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 380.0, 404.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 114.0, 419.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 380.0, 419.0, FontSize: 8.0);
    }

    public static class ShipDetails
    {
        public static readonly PdfField NameOfShipVessel = new("Ship.Name", 114.0, 449.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField CallSign = new("Ship.CallSign", 447.0, 449.0, FontSize: 8.0, IsBold: true);

        public static readonly PdfField MmsiNo = new("Ship.MmsiNo", 114.0, 464.0, FontSize: 8.0);
        public static readonly PdfField StationLicenseNo = new("Ship.StationLicenseNo", 447.0, 464.0, FontSize: 8.0);

        public static readonly PdfField ImoNo = new("Ship.ImoNo", 114.0, 479.0, FontSize: 8.0);
        public static readonly PdfField Validity = new("Ship.Validity", 447.0, 479.0, FontSize: 8.0);
    }

    public static class Equipment
    {
        public static readonly PdfField RadioEquipmentRow1 = new("Equipment.RadioEquipment.1", 16.0, 527.0, FontSize: 8.0);
        public static readonly PdfField MakeRow1 = new("Equipment.Make.1", 114.0, 527.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow1 = new("Equipment.TypeModel.1", 235.0, 527.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow1 = new("Equipment.SerialNumber.1", 356.0, 527.0, FontSize: 8.0);
        public static readonly PdfField PowerOutputRow1 = new("Equipment.PowerOutput.1", 495.0, 527.0, FontSize: 8.0);

        public static readonly PdfField RadioEquipmentRow2 = new("Equipment.RadioEquipment.2", 16.0, 542.0, FontSize: 8.0);
        public static readonly PdfField MakeRow2 = new("Equipment.Make.2", 114.0, 542.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow2 = new("Equipment.TypeModel.2", 235.0, 542.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow2 = new("Equipment.SerialNumber.2", 356.0, 542.0, FontSize: 8.0);
        public static readonly PdfField PowerOutputRow2 = new("Equipment.PowerOutput.2", 495.0, 542.0, FontSize: 8.0);

        public static readonly PdfField RadioEquipmentRow3 = new("Equipment.RadioEquipment.3", 16.0, 557.0, FontSize: 8.0);
        public static readonly PdfField MakeRow3 = new("Equipment.Make.3", 114.0, 557.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow3 = new("Equipment.TypeModel.3", 235.0, 557.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow3 = new("Equipment.SerialNumber.3", 356.0, 557.0, FontSize: 8.0);
        public static readonly PdfField PowerOutputRow3 = new("Equipment.PowerOutput.3", 495.0, 557.0, FontSize: 8.0);

        public static readonly PdfField RadioEquipmentRow4 = new("Equipment.RadioEquipment.4", 16.0, 572.0, FontSize: 8.0);
        public static readonly PdfField MakeRow4 = new("Equipment.Make.4", 114.0, 572.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow4 = new("Equipment.TypeModel.4", 235.0, 572.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow4 = new("Equipment.SerialNumber.4", 356.0, 572.0, FontSize: 8.0);
        public static readonly PdfField PowerOutputRow4 = new("Equipment.PowerOutput.4", 495.0, 572.0, FontSize: 8.0);

        public static readonly PdfField RadioEquipmentRow5 = new("Equipment.RadioEquipment.5", 16.0, 587.0, FontSize: 8.0);
        public static readonly PdfField MakeRow5 = new("Equipment.Make.5", 114.0, 587.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow5 = new("Equipment.TypeModel.5", 235.0, 587.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow5 = new("Equipment.SerialNumber.5", 356.0, 587.0, FontSize: 8.0);
        public static readonly PdfField PowerOutputRow5 = new("Equipment.PowerOutput.5", 495.0, 587.0, FontSize: 8.0);
    }

    public static class Operators
    {
        public static readonly PdfField Op1Name = new("Operators.1.Name", 138.0, 617.0, FontSize: 8.0);
        public static readonly PdfField Op1CertNo = new("Operators.1.CertNo", 138.0, 632.0, FontSize: 8.0);
        public static readonly PdfField Op1Validity = new("Operators.1.Validity", 138.0, 646.0, FontSize: 8.0);

        public static readonly PdfField Op2Name = new("Operators.2.Name", 356.0, 617.0, FontSize: 8.0);
        public static readonly PdfField Op2CertNo = new("Operators.2.CertNo", 356.0, 632.0, FontSize: 8.0);
        public static readonly PdfField Op2Validity = new("Operators.2.Validity", 356.0, 646.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 182.2,
            Y: 737.0,
            Width: 241.2,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 182.25,
            Y: 776.0,
            Width: 144.3,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 455.0, 729.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 459.0, 740.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 528.0, 740.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 445.0, 751.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 475.0,
            Y: 771.0,
            Width: 110.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
