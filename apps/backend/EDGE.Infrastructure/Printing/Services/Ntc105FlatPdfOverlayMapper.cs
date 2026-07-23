using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc105Application (NTC 1-05 Form A - Multiple Stations/Equipment) onto coordinate positions
/// (X, Y in points) for flat PDF templates using PdfSharp XGraphics overlay.
///
/// Page size: 595.2 x 841.8 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Coordinates measured directly from ntc-1-05.pdf template vector geometry.
/// </summary>
public static class Ntc105FlatPdfOverlayMapper
{
    private const double RegularCharWidthFactor = 0.52;
    private const double BoldCharWidthFactor = 0.62;

    private static double EstimateTextWidth(string text, double fontSize, bool isBold)
    {
        if (string.IsNullOrEmpty(text)) return 0;
        return text.Length * fontSize * (isBold ? BoldCharWidthFactor : RegularCharWidthFactor);
    }

    private static double CenterX(double boxLeft, double boxRight, string text, double fontSize, bool isBold)
    {
        double width = EstimateTextWidth(text, fontSize, isBold);
        double boxCenter = (boxLeft + boxRight) / 2.0;
        return boxCenter - (width / 2.0);
    }

    public static List<TextOverlayItem> MapToOverlayItems(Ntc105Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. APPLICANT NAME
        if (!string.IsNullOrWhiteSpace(app.ApplicantName))
        {
            items.Add(new TextOverlayItem { X = 100, Y = 154.0, Text = app.ApplicantName, FontSize = 8, IsBold = true });
        }

        // 2. PARTICULARS OF EQUIPMENT (Up to 32 rows)
        // Row 1 starts at y0 = 229.58, bottom = 243.86 (baseline = 241.0). Each subsequent row step = 14.16 pt.
        const double firstRowY = 241.0;
        const double rowHeight = 14.16;

        for (int i = 0; i < app.Equipment.Count && i < 32; i++)
        {
            var eq = app.Equipment[i];
            double y = firstRowY + (i * rowHeight);

            items.Add(new TextOverlayItem { X = 38, Y = y, Text = eq.RadioEquipment, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 144, Y = y, Text = eq.Make, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 251, Y = y, Text = eq.TypeModel, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 358, Y = y, Text = eq.SerialNumber, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 465, Y = y, Text = eq.PowerOutput, FontSize = 8 });
        }

        // 3. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(33.3, 331.8, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 723.0, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(118.8, 245.4, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 766.0, Text = dateAccomplishedText, FontSize = 8 });
        }

        return items;
    }
}
