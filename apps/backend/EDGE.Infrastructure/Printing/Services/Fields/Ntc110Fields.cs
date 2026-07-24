using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-10 (Radio Station License Commercial Multi-Entry Annex).
/// </summary>
public static class Ntc110Fields
{
    public static readonly PdfField ApplicantName = new("Applicant.Name", 112.0, 153.0, FontSize: 8.0, IsBold: true);

    public static readonly double[] StationRowY = { 243.7, 258.9, 274.0, 289.1, 304.2, 319.4, 334.5, 349.6, 364.7, 379.8, 395.0, 410.1, 425.2 };
    public static readonly double[] EquipmentRowY = { 455.5, 470.6, 485.7, 500.8 };
    public static readonly double[] AntennaRowY = { 531.1, 546.2, 561.3, 576.4, 591.5, 606.7, 621.8 };

    public static readonly double[] ColTextX = { 150.78, 260.61, 370.43, 480.26 };
    public static readonly double[] ColFontSize = { 6.5, 6.5, 6.5, 6.0 };

    public static PdfField StationField(int col, int row, string name, bool isBold = false) =>
        new($"Station.Col{col + 1}.{name}", ColTextX[col], StationRowY[row], FontSize: ColFontSize[col], IsBold: isBold);

    public static PdfField EquipmentField(int col, int row, string name) =>
        new($"Equipment.Col{col + 1}.{name}", ColTextX[col], EquipmentRowY[row], FontSize: ColFontSize[col]);

    public static PdfField AntennaField(int col, int row, string name) =>
        new($"Antenna.Col{col + 1}.{name}", ColTextX[col], AntennaRowY[row], FontSize: ColFontSize[col]);

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 190.05,
            Y: 667.0,
            Width: 308.1,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 193.2,
            Y: 712.0,
            Width: 172.56,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
