using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-05 Form A (Multiple Stations/Equipment Annex).
/// </summary>
public static class Ntc105Fields
{
    public static readonly PdfField ApplicantName = new("Applicant.Name", 100.0, 154.0, FontSize: 8.0, IsBold: true);

    public static class Equipment
    {
        public const double FirstRowY = 241.0;
        public const double RowHeight = 14.16;

        public static PdfField RadioEquipment(int index) => new($"Equipment.RadioEquipment.{index + 1}", 38.0, FirstRowY + (index * RowHeight), FontSize: 8.0);
        public static PdfField Make(int index) => new($"Equipment.Make.{index + 1}", 144.0, FirstRowY + (index * RowHeight), FontSize: 8.0);
        public static PdfField TypeModel(int index) => new($"Equipment.TypeModel.{index + 1}", 251.0, FirstRowY + (index * RowHeight), FontSize: 8.0);
        public static PdfField SerialNumber(int index) => new($"Equipment.SerialNumber.{index + 1}", 358.0, FirstRowY + (index * RowHeight), FontSize: 8.0);
        public static PdfField PowerOutput(int index) => new($"Equipment.PowerOutput.{index + 1}", 465.0, FirstRowY + (index * RowHeight), FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 182.55,
            Y: 723.0,
            Width: 298.5,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 182.1,
            Y: 766.0,
            Width: 126.6,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
