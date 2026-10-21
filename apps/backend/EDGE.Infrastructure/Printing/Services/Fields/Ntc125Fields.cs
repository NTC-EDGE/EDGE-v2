using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-25 (Complaint Form - Rev 03 03/31/2025).
/// Coordinates precisely map against the official flat PDF template (templates/NTC1-25.pdf).
/// Page dimensions: 595.28 x 841.89 pt (A4). Top-left origin.
/// </summary>
public static class Ntc125Fields
{
    public static class Complainant
    {
        // Table cell: X = 143.0 to 568.4, Row 1 (Top-Y: 237.5 to 252.7)
        public static readonly PdfField Name = new(
            "Complainant.Name",
            X: 148.0,
            Y: 248.5,
            Width: 416.0,
            FontSize: 8.5,
            IsBold: true);

        // Row 2 (Top-Y: 252.5 to 267.7)
        public static readonly PdfField Address = new(
            "Complainant.Address",
            X: 148.0,
            Y: 263.5,
            Width: 416.0,
            FontSize: 8.0);

        // Row 3 (Top-Y: 267.5 to 282.8)
        public static readonly PdfField Email = new(
            "Complainant.Email",
            X: 148.0,
            Y: 278.5,
            Width: 416.0,
            FontSize: 8.0);

        // Row 4 (Top-Y: 282.6 to 297.8)
        public static readonly PdfField ContactNumber = new(
            "Complainant.ContactNumber",
            X: 148.0,
            Y: 293.5,
            Width: 416.0,
            FontSize: 8.5);
    }

    public static class ServiceProvider
    {
        // Table cell: X = 143.0 to 568.4, Row 1 (Top-Y: 312.6 to 327.8)
        public static readonly PdfField BusinessName = new(
            "Provider.BusinessName",
            X: 148.0,
            Y: 323.5,
            Width: 416.0,
            FontSize: 8.5,
            IsBold: true);

        // Row 2 (Top-Y: 327.6 to 342.8)
        public static readonly PdfField BusinessAddress = new(
            "Provider.BusinessAddress",
            X: 148.0,
            Y: 338.5,
            Width: 416.0,
            FontSize: 8.0);

        // Row 3 (Top-Y: 342.6 to 357.8)
        public static readonly PdfField ContactNumber = new(
            "Provider.ContactNumber",
            X: 148.0,
            Y: 353.5,
            Width: 416.0,
            FontSize: 8.5);
    }

    public static class NatureOfComplaint
    {
        // Column 1 checkboxes (Cell X: 28.8 to 50.4, Center X: 39.6)
        // With CheckboxFieldRenderer (cx = field.X + 3.0, cy = field.Y - 3.2):
        // Target center cx = 39.6 => field.X = 36.6
        // Row 1 (Center Y = 380.7) => field.Y = 383.9
        public static readonly PdfField BillingComplaint = new("Nature.BillingComplaint", 36.6, 383.9);

        // Row 2 (Center Y = 395.7) => field.Y = 398.9
        public static readonly PdfField Spam = new("Nature.Spam", 36.6, 398.9);

        // Row 3 (Center Y = 410.7) => field.Y = 413.9
        public static readonly PdfField Scam = new("Nature.Scam", 36.6, 413.9);

        // Row 4 (Center Y = 426.0) => field.Y = 429.2
        public static readonly PdfField FairUse = new("Nature.FairUse", 36.6, 429.2);

        // Column 2 checkboxes (Cell X: 188.5 to 211.5, Center X = 200.0)
        // Target center cx = 200.0 => field.X = 197.0
        // Row 1 (Center Y = 380.7) => field.Y = 383.9
        public static readonly PdfField PoorService = new("Nature.PoorService", 197.0, 383.9);

        // Row 2 (Center Y = 395.7) => field.Y = 398.9
        public static readonly PdfField DenialOfSubscription = new("Nature.DenialOfSubscription", 197.0, 398.9);

        // Row 3 (Center Y = 410.7) => field.Y = 413.9
        public static readonly PdfField Others = new("Nature.Others", 197.0, 413.9);

        // Others specification input box: X: 211.9 to 350.1, Top-Y: 417.6 to 433.4
        public static readonly PdfField OthersSpecification = new(
            "Nature.OthersSpecification",
            X: 215.0,
            Y: 428.5,
            Width: 132.0,
            FontSize: 8.0);

        // Incident Date: input box X: 188.9 to 327.1, Top-Y: 447.0 to 462.2
        public static readonly PdfField DateOfIncident = new(
            "Nature.DateOfIncident",
            X: 192.0,
            Y: 457.5,
            Width: 132.0,
            FontSize: 8.5);

        // Incident Time: input box X: 188.9 to 327.1, Top-Y: 462.0 to 477.2
        public static readonly PdfField TimeOfIncident = new(
            "Nature.TimeOfIncident",
            X: 192.0,
            Y: 472.5,
            Width: 132.0,
            FontSize: 8.5);
    }

    public static class Details
    {
        // Multiline text area box: X = 28.0 to 568.7, Top-Y: 507.0 to 567.2 (Height = 60.2)
        public static readonly PdfField StateBriefly = new(
            "Details.StateBriefly",
            X: 32.0,
            Y: 519.0,
            Width: 532.0,
            Height: 52.0,
            FontSize: 8.0);
    }

    public static class AttachedDocuments
    {
        // Attached Supporting Documents Grid:
        // Col 1 (X = 32.0 to 300.0, Width = 268.0), Col 2 (X = 308.0 to 565.0, Width = 257.0)
        // Row 1 (Top-Y: 582.6 to 597.6)
        public static readonly PdfField Col1Row1 = new("Attached.Col1Row1", 34.0, 593.0, Width: 264.0, FontSize: 7.5);
        public static readonly PdfField Col2Row1 = new("Attached.Col2Row1", 310.0, 593.0, Width: 254.0, FontSize: 7.5);

        // Row 2 (Top-Y: 597.6 to 612.0)
        public static readonly PdfField Col1Row2 = new("Attached.Col1Row2", 34.0, 607.0, Width: 264.0, FontSize: 7.5);
        public static readonly PdfField Col2Row2 = new("Attached.Col2Row2", 310.0, 607.0, Width: 254.0, FontSize: 7.5);

        // Row 3 (Top-Y: 612.0 to 628.2)
        public static readonly PdfField Col1Row3 = new("Attached.Col1Row3", 34.0, 623.0, Width: 264.0, FontSize: 7.5);
        public static readonly PdfField Col2Row3 = new("Attached.Col2Row3", 310.0, 623.0, Width: 254.0, FontSize: 7.5);
    }

    public static class Declaration
    {
        // Signature over Printed Name box: X: 50.8 to 350.1, Top-Y: 722.5 to 736.5
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 52.0,
            Y: 732.0,
            Width: 296.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            FontSize: 9.0,
            IsBold: true);

        // Date Accomplished box: X: 124.8 to 275.2, Top-Y: 750.5 to 764.9
        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 126.0,
            Y: 760.0,
            Width: 146.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            FontSize: 8.5);
    }
}
