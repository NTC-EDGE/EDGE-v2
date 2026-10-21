using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Layout coordinate constants for the Official NTC Official Receipt (Accountable Form No. 51) Landscape Template.
/// Dimensions: 792 x 612 pt (US Letter Landscape). Origin: Top-Left.
/// </summary>
public static class OfficialReceiptLandscapeFields
{
    public static class Header
    {
        // "No" label is at X=527.3, Y=522.95 (Top-Y=89.05).
        // Official Receipt Number in bold red text
        public static readonly PdfField ReceiptNumber = new(
            "Header.ReceiptNumber",
            X: 565.0,
            Y: 96.0,
            Width: 180.0,
            FontSize: 16.0,
            IsBold: true,
            TextColor: "#D32F2F");

        // "DATE:" label is at X=528.5, Y=466.55 (Top-Y=145.45).
        public static readonly PdfField Date = new(
            "Header.Date",
            X: 580.0,
            Y: 145.5,
            Width: 170.0,
            FontSize: 10.0,
            IsBold: true);
    }

    public static class Payor
    {
        // "PAYOR:" label is at X=43.2, Y=422.35 (Top-Y=189.65).
        public static readonly PdfField Name = new(
            "Payor.Name",
            X: 110.0,
            Y: 189.5,
            Width: 635.0,
            FontSize: 10.5,
            IsBold: true);
    }

    public static class DetailsTable
    {
        // Table vertical bounds on statutory template: TopY = 244.27 to 427.73 (Height = 183.46 pt).
        // Left border at X=36.20, vertical separator line at X=516.33, right border at X=756.0.
        // Row height: 18.0 pt, supporting up to 8 individual fee breakdown items matching SOA.
        public const double StartY = 252.0;
        public const double RowHeight = 18.0;
        public const double DescriptionX = 46.0;
        public const double DescriptionWidth = 465.0;
        public const double AmountX = 525.0;
        public const double AmountWidth = 220.0;

        // Total Row: Top-Y = 414.0, directly above the bottom table boundary (TopY = 427.73)
        public static readonly PdfField TotalLabel = new(
            "Details.TotalLabel",
            X: 380.0,
            Y: 414.0,
            Width: 130.0,
            FontSize: 10.0,
            IsBold: true,
            HorizontalAlignment: HorizontalAlignment.Right);

        public static readonly PdfField TotalAmount = new(
            "Details.TotalAmount",
            X: 525.0,
            Y: 414.0,
            Width: 220.0,
            FontSize: 10.5,
            IsBold: true,
            HorizontalAlignment: HorizontalAlignment.Right);
    }

    public static class AmountInWords
    {
        // "Amount in Words:" is at X=41.6, Y=168.45 (Top-Y=443.55)
        public static readonly PdfField Text = new(
            "AmountInWords.Text",
            X: 160.0,
            Y: 443.5,
            Width: 585.0,
            FontSize: 9.0,
            IsBold: true);
    }

    public static class PaymentMode
    {
        // "MODE OF PAYMENT:" at X=41.6, Y=119.05 (Top-Y=492.95)
        // Cash at X=276.27 -> Box around X=258.0, Y=496.0
        public static readonly PdfField CashCheckbox = new("Mode.Cash", 258.0, 496.0);

        // Check/PMO at X=388.3 -> Box around X=370.0, Y=496.0
        public static readonly PdfField CheckCheckbox = new("Mode.Check", 370.0, 496.0);

        // Check / Money Order Number: at X=41.6, Y=92.83 (Top-Y=519.17)
        public static readonly PdfField CheckNumber = new(
            "Mode.CheckNumber",
            X: 200.0,
            Y: 519.0,
            Width: 180.0,
            FontSize: 9.0);

        // Date: at X=396.9, Y=90.83 (Top-Y=521.17)
        public static readonly PdfField CheckDate = new(
            "Mode.CheckDate",
            X: 435.0,
            Y: 521.0,
            Width: 100.0,
            FontSize: 9.0);
    }

    public static class Officer
    {
        // "COLLECTING OFFICER" signature line: Top-Y=534.8.
        public static readonly PdfField CollectingOfficer = new(
            "Officer.CollectingOfficer",
            X: 527.0,
            Y: 532.0,
            Width: 220.0,
            FontSize: 10.0,
            IsBold: true,
            HorizontalAlignment: HorizontalAlignment.Center);
    }
}
