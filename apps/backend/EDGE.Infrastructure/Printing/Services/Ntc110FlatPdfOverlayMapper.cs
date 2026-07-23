using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc110Application (NTC 1-10 Form E - Multiple Stations/Equipment) onto coordinate positions
/// (X, Y in points) for flat PDF templates using PdfSharp XGraphics overlay.
///
/// Page size: 595.3 x 841.9 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Baselines calibrated as (cell_rect.y_bottom - 3.0) for precise in-cell vertical alignment.
///
/// The template has 4 pre-drawn column dividers. Column content start X values are
/// measured directly from the template's divider box right edges plus 4pt left padding.
/// Columns 1-3 are ~108.9pt wide; column 4 is ~87pt wide (uses 6pt font instead of 6.5pt).
/// </summary>
public static class Ntc110FlatPdfOverlayMapper
{
    private const double RegularCharWidthFactor = 0.52;
    private const double BoldCharWidthFactor = 0.62;

    // Precise baselines per row, derived from cell rect bottoms (y_bot - 3.0).
    // Station block rows (13): EXACT LOCATION → OTHERS
    private static readonly double[] StationRowY = { 243.7, 258.9, 274.0, 289.1, 304.2, 319.4, 334.5, 349.6, 364.7, 379.8, 395.0, 410.1, 425.2 };
    // Equipment block rows (4): MAKE/TYPE/MODEL → FREQ. RANGE
    private static readonly double[] EquipmentRowY = { 455.5, 470.6, 485.7, 500.8 };
    // Antenna block rows (7): TYPE → BEAMWIDTH
    private static readonly double[] AntennaRowY = { 531.1, 546.2, 561.3, 576.4, 591.5, 606.7, 621.8 };

    // Column text start X: measured from template divider box right edges + 4pt padding.
    // Template divider right edges: 146.78, 256.61, 366.43, 476.26
    private static readonly double[] ColTextX = { 150.78, 260.61, 370.43, 480.26 };

    // Column content right edges (next divider left edge or outer border):
    //   255.65, 365.47, 475.30, 563.28
    private static readonly double[] ColEndX = { 255.65, 365.47, 475.30, 563.28 };

    // Right padding buffer to prevent text overflow into the next column border
    private const double CellPaddingRight = 3.0;

    // Font sizes: cols 1-3 have 108.9pt width → 6.5pt fits ~30 chars; col 4 is 87pt → 6pt fits ~23 chars
    private static readonly double[] ColFontSize = { 6.5, 6.5, 6.5, 6.0 };

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

    public static List<TextOverlayItem> MapToOverlayItems(Ntc110Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. APPLICANT NAME
        if (!string.IsNullOrWhiteSpace(app.ApplicantName))
        {
            items.Add(new TextOverlayItem { X = 112, Y = 153.0, Text = app.ApplicantName, FontSize = 8, IsBold = true });
        }

        // 2. MULTI-COLUMN STATION / EQUIPMENT / ANTENNA PARTICULARS (Up to 4 columns)
        int colCount = app.Entries.Count > 0 ? System.Math.Min(app.Entries.Count, 4) : 1;

        for (int c = 0; c < colCount; c++)
        {
            var entry = app.Entries[c];
            double colX = ColTextX[c];
            double colEnd = ColEndX[c];
            double fontSize = ColFontSize[c];
            double availWidth = colEnd - colX - CellPaddingRight;
            int maxChars = (int)(availWidth / (fontSize * RegularCharWidthFactor));

            // STATION ROWS (13 rows: Exact Location, Longitude, Latitude, Points of Comm, Service Area,
            //               Assigned Freq, BW & Emission, Configuration, Data Rate, Call Sign,
            //               RSL No., Validity, Others)
            var st = entry.ProposedStation;
            string[] stationValues =
            {
                Fit(st.ExactLocation, maxChars),
                Fit(st.Longitude, maxChars),
                Fit(st.Latitude, maxChars),
                Fit(st.PointsOfCommServiceArea, maxChars),   // POINTS OF COMM.
                Fit(st.ServiceArea, maxChars),               // SERVICE AREA (separate field)
                Fit(st.AssignedFreq, maxChars),
                Fit(st.BwEmission, maxChars),
                Fit(st.Configuration, maxChars),
                Fit(st.DataRate, maxChars),
                Fit(st.CallSign, maxChars),
                Fit(st.RslNo, maxChars),
                st.Validity != default ? st.Validity.ToString("MM/dd/yy") : "",
                Fit(st.Others, maxChars)
            };

            for (int r = 0; r < stationValues.Length && r < StationRowY.Length; r++)
            {
                if (!string.IsNullOrEmpty(stationValues[r]))
                    items.Add(new TextOverlayItem { X = colX, Y = StationRowY[r], Text = stationValues[r], FontSize = fontSize, IsBold = r == 9 });
            }

            // EQUIPMENT ROWS (4 rows: Make/Type/Model, Serial No., Power Output, Freq. Range)
            var eq = entry.Equipment;
            string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
                ? $"{eq.Make} {eq.TypeModel}".Trim()
                : eq.RadioEquipment;

            string[] equipValues =
            {
                Fit(makeModel, maxChars),
                Fit(eq.SerialNumber, maxChars),
                Fit(eq.PowerOutput, maxChars),
                Fit(eq.FrequencyRange, maxChars)
            };

            for (int r = 0; r < equipValues.Length && r < EquipmentRowY.Length; r++)
            {
                if (!string.IsNullOrEmpty(equipValues[r]))
                    items.Add(new TextOverlayItem { X = colX, Y = EquipmentRowY[r], Text = equipValues[r], FontSize = fontSize });
            }

            // ANTENNA ROWS (7 rows: Type, Height, Gain, Directivity, Diameter, Polarization, Beamwidth)
            var ant = entry.Antenna;
            string[] antennaValues =
            {
                Fit(ant.Type, maxChars),
                ant.HeightM > 0 ? $"{ant.HeightM} m" : "",
                ant.GainDbi > 0 ? $"{ant.GainDbi} dBi" : "",
                ant.DirectivityDegrees > 0 ? $"{ant.DirectivityDegrees}°" : "",
                Fit(ant.Diameter, maxChars),
                Fit(ant.Polarization, maxChars),
                ant.BeamwidthDegrees > 0 ? $"{ant.BeamwidthDegrees}°" : ""
            };

            for (int r = 0; r < antennaValues.Length && r < AntennaRowY.Length; r++)
            {
                if (!string.IsNullOrEmpty(antennaValues[r]))
                    items.Add(new TextOverlayItem { X = colX, Y = AntennaRowY[r], Text = antennaValues[r], FontSize = fontSize });
            }
        }

        // 3. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(36.00, 344.11, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 664.0, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(106.92, 279.48, dateText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 709.0, Text = dateText, FontSize = 8 });
        }

        return items;
    }

    private static string Fit(string text, int maxChars)
    {
        if (string.IsNullOrEmpty(text)) return "";
        return text.Length > maxChars ? text.Substring(0, maxChars) : text;
    }
}
