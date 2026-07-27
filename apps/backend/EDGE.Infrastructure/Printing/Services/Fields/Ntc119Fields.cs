using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-19 (Certificate of Registration Application).
/// </summary>
public static class Ntc119Fields
{
    public static class EquipmentDeviceType
    {
        public static readonly PdfField WdnIndoor = new("EquipmentDeviceType.WdnIndoor", 85.9, 234.9);
        public static readonly PdfField Srd = new("EquipmentDeviceType.Srd", 85.9, 249.9);
        public static readonly PdfField Rfid = new("EquipmentDeviceType.Rfid", 85.9, 264.9);
        public static readonly PdfField Srrs = new("EquipmentDeviceType.Srrs", 85.9, 279.9);
        public static readonly PdfField PublicTrunkedRadio = new("EquipmentDeviceType.PublicTrunkedRadio", 85.9, 294.9);
    }

    public static class Applicant
    {
        public static readonly PdfField Name = new("Applicant.Name", 100.0, 336.7, FontSize: 8.0, IsBold: true);
        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 145.0, 351.7, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 378.0, 351.7, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 145.0, 366.7, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 378.0, 366.7, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 145.0, 381.7, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 378.0, 381.7, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 145.0, 396.7, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 378.0, 396.7, FontSize: 8.0);

        public static readonly PdfField PermitToImportNo = new("Applicant.PermitToImportNo", 145.0, 411.7, FontSize: 8.0);
        public static readonly PdfField InvoiceNo = new("Applicant.InvoiceNo", 378.0, 411.7, FontSize: 8.0);

        public static readonly PdfField CpcnPaRslNo = new("Applicant.CpcnPaRslNo", 145.0, 426.7, FontSize: 8.0);
        public static readonly PdfField Validity = new("Applicant.Validity", 422.0, 426.7, FontSize: 8.0);
    }

    public static class Devices
    {
        public const double StartRowY = 471.2;
        public const double RowHeight = 15.03;

        public static PdfField MakeTypeModel(int index) => new($"Devices.MakeTypeModel.{index + 1}", 35.0, StartRowY + (index * RowHeight), FontSize: 8.0);

        public static PdfField Quantity(int index) => new(
            $"Devices.Quantity.{index + 1}",
            X: 304.0,
            Y: StartRowY + (index * RowHeight),
            Width: 184.05,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);

        public static PdfField SerialNumber(int index) => new($"Devices.SerialNumber.{index + 1}", 410.0, StartRowY + (index * RowHeight), FontSize: 8.0);

        public static readonly PdfField TotalQuantity = new(
            "Devices.TotalQuantity",
            X: 304.0,
            Y: 636.6,
            Width: 184.05,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 200.86,
            Y: 730.0,
            Width: 299.32,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 201.575,
            Y: 775.0,
            Width: 149.65,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 450.0, 723.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 460.0, 734.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 514.0, 734.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 435.0, 747.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 475.0,
            Y: 767.0,
            Width: 110.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
