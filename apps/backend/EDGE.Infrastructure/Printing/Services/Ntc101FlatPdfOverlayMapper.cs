using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc101Application onto coordinate positions (X, Y in points)
/// for non-fillable (flat) NTC 1-01 PDF templates using PdfSharp XGraphics overlay.
///
/// Coordinates below were re-derived from the actual template geometry (PyMuPDF
/// get_text("words") for label boxes, get_drawings() for the real cell grid, and
/// pixel-histogram analysis of the flattened OR-receipt image), per
/// Flat_PDF_Overlay_Mapping_Principles.md. They were NOT eyeballed.
///
/// Previous version bugs found by this pass:
///  - Applicant's Details block used a uniform 15pt row step, but the form's real
///    row height is 11.88pt and has 7 rows (Last/First/Middle Name, Unit-Room,
///    Barangay, Province, Contact Number), not 5. The old code silently skipped the
///    "First Name / Sex" and "Middle Name / Nationality" rows, so every field from
///    UnitRoomBldgNo onward rendered two rows too high (visibly overlapping First/
///    Middle Name in the sample output).
///  - Right-hand column used a guessed X=370; the real column divider (from
///    get_drawings) is at x=411.96.
///  - The "Particulars of Equipment" loop targeted a table that does not exist on
///    this form at all (NTC 1-01 is an exam application, not an equipment/station
///    registration form) - get_text("words") returns zero hits for "quantity",
///    "serial", or "model" anywhere on the page. That loop was overlaying stray
///    equipment text on top of the DECLARATION paragraph. It has been removed;
///    see the note at the bottom of this file if equipment data ever needs to be
///    added to a form that actually has such a table.
///  - Signature/Date Accomplished/OR receipt/Collecting Officer were all placed at
///    Y=710-780, which lands inside the EXAMINATION ADMISSION SLIP's "Authorized
///    Officer" area near the bottom of the page - nowhere near the real Declaration
///    signature box (y ~524-559) or the real OR receipt box (y ~510-565, a
///    flattened image at x:392.4-569.16 / y:497.88-582.48 per get_image_rects).
/// </summary>
public static class Ntc101FlatPdfOverlayMapper
{
    // Approximate average glyph-width-to-fontsize ratio for this form's font, used only
    // to center text within a cell when we don't have real glyph metrics available
    // (e.g. XGraphics.MeasureString). Calibrated the same way as the NTC 1-19 mapper:
    // ~0.52 for regular weight, ~0.62 for bold. Swap for real string measurement if
    // perfect centering on unusual text lengths ever matters.
    private const double RegularCharWidthFactor = 0.52;
    private const double BoldCharWidthFactor = 0.62;

    private static double EstimateTextWidth(string text, double fontSize, bool isBold)
    {
        var factor = isBold ? BoldCharWidthFactor : RegularCharWidthFactor;
        return (text?.Length ?? 0) * fontSize * factor;
    }

    /// <summary>Centers text horizontally within [cellLeft, cellRight] using an estimated glyph width.</summary>
    private static double CenterX(double cellLeft, double cellRight, string text, double fontSize, bool isBold)
    {
        var center = (cellLeft + cellRight) / 2.0;
        var width = EstimateTextWidth(text, fontSize, isBold);
        return center - (width / 2.0);
    }

    public static List<TextOverlayItem> MapToOverlayItems(Ntc101Application app)
    {
        var items = new List<TextOverlayItem>();

        // ---------------------------------------------------------------
        // 1. Applicant Details
        //
        // Grid extracted from get_drawings() cell rects for the "APPLICANT'S
        // DETAILS" table (7 rows, row height 11.88pt, baseline = row_bottom - 3):
        //   Row "Last Name / Date of Birth"        : bottom y=327.36
        //   Row "First Name / Sex"                 : bottom y=339.24  (not used - no field)
        //   Row "Middle Name / Nationality"        : bottom y=351.12  (not used - no field)
        //   Row "Unit/Rm/House/Bldg No. / Street"  : bottom y=362.99
        //   Row "Barangay / City/Municipality"     : bottom y=374.88
        //   Row "Province / Zip Code"              : bottom y=386.76
        //   Row "Contact Number / Email Address"   : bottom y=398.64
        //
        // Left-column value cell starts at x=93.72 for the Name row but x=142.68
        // for every row below it (the Name row's divider sits further left than
        // the rest of the block - same "per-row divider" pattern called out in the
        // mapping principles doc). Right-column value cell starts at x=411.96 for
        // every row. +4pt padding applied after each divider.
        // ---------------------------------------------------------------
        var a = app.Applicant;

        // Last Name row, bottom=327.36, baseline=324.36, left col starts x=93.72
        items.Add(new TextOverlayItem { X = 97.7, Y = 324.4, Text = a.Name, FontSize = 8, IsBold = true });

        // Unit/Rm/House/Bldg No. / Street row, bottom=362.99, baseline=360.0
        items.Add(new TextOverlayItem { X = 146.7, Y = 360.0, Text = a.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 416.0, Y = 360.0, Text = a.Address.Street, FontSize = 8 });

        // Barangay / City-Municipality row, bottom=374.88, baseline=371.9
        items.Add(new TextOverlayItem { X = 146.7, Y = 371.9, Text = a.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 416.0, Y = 371.9, Text = a.Address.CityMunicipality, FontSize = 8 });

        // Province / Zip Code row, bottom=386.76, baseline=383.8
        items.Add(new TextOverlayItem { X = 146.7, Y = 383.8, Text = a.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 416.0, Y = 383.8, Text = a.Address.ZipCode, FontSize = 8 });

        // Contact Number / Email Address row, bottom=398.64, baseline=395.6
        items.Add(new TextOverlayItem { X = 146.7, Y = 395.6, Text = a.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 416.0, Y = 395.6, Text = a.Email, FontSize = 8 });

        // ---------------------------------------------------------------
        // 2. Signature & Declaration
        //
        // Cell rects from get_drawings():
        //   Signature/printed-name box: x:[44.76, 314.16], y:[523.80, 535.80]
        //   Date Accomplished box:      x:[118.20, 240.72], y:[547.08, 559.08]
        // Both sit directly above their printed labels ("Signature over Printed
        // Name of Applicant" at y=535.93-545.98, "Date Accomplished" at
        // y=559.45-569.50), confirming these are the correct target rows.
        // Baseline = box_bottom - 3. Centered horizontally in the box since these
        // read as a signature/printed-name line rather than a left-aligned field.
        // ---------------------------------------------------------------
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            const double sigCellLeft = 44.76, sigCellRight = 314.16, sigBaselineY = 532.8;
            var x = CenterX(sigCellLeft, sigCellRight, app.Declaration.SignatoryName, 8, isBold: true);
            items.Add(new TextOverlayItem { X = x, Y = sigBaselineY, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }

        if (app.Declaration.DateAccomplished != default)
        {
            var dateText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            const double dateCellLeft = 118.20, dateCellRight = 240.72, dateBaselineY = 556.1;
            var x = CenterX(dateCellLeft, dateCellRight, dateText, 8, isBold: false);
            items.Add(new TextOverlayItem { X = x, Y = dateBaselineY, Text = dateText, FontSize = 8 });
        }

        // ---------------------------------------------------------------
        // 3. Official Receipt (OR) box
        //
        // This box is a flattened image (get_images()/get_image_rects() locates it
        // at x:[392.40, 569.16], y:[497.88, 582.48]; get_text("words") returns no
        // labels for it), so the writable blanks were found by rendering at high
        // zoom (Matrix(8,8)) and taking row/column darkness histograms to locate
        // the printed rule lines rather than guessing:
        //   "OR NO.:" blank      -> rule line at y=519.9-520.1, spans x=475.2-557.2
        //   "DATE:____,20____"   -> rule line at y=532.5-532.75, TWO blanks:
        //                           day/month at x=475.2-519.0, year at x=535.8-557.2
        //   "AMOUNT:" blank      -> rule line at y=544.4-544.75, spans x=446.4-556.9
        //   Collecting Officer signature line -> rule at y=564.5-564.75,
        //                           spans x=429.9-535.6 (label "Collecting Officer"
        //                           printed underneath at y=568-575, confirming this
        //                           is the signature line, not a separate field)
        // Values are placed ~1.5pt above each rule so text sits on the line; +3pt
        // left padding after each rule's start for non-centered fields.
        // ---------------------------------------------------------------
        if (app.Payment != null)
        {
            if (!string.IsNullOrWhiteSpace(app.Payment.OrNo))
            {
                items.Add(new TextOverlayItem { X = 478.2, Y = 518.4, Text = app.Payment.OrNo, FontSize = 8 });
            }

            if (app.Payment.OrDate != default)
            {
                // Template pre-prints ", 20" between the two date blanks, so split
                // "MM/dd" into the first blank and the 2-digit year into the second.
                items.Add(new TextOverlayItem { X = 478.2, Y = 531.0, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 538.8, Y = 531.0, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }

            items.Add(new TextOverlayItem { X = 449.4, Y = 542.9, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });

            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                const double officerCellLeft = 429.9, officerCellRight = 535.6, officerBaselineY = 562.9;
                var x = CenterX(officerCellLeft, officerCellRight, app.Payment.CollectingOfficer, 8, isBold: false);
                items.Add(new TextOverlayItem { X = x, Y = officerBaselineY, Text = app.Payment.CollectingOfficer, FontSize = 8 });
            }
        }

        // NOTE: NTC 1-01 has no "Particulars of Equipment" table (confirmed via
        // get_text("words") - no "Quantity"/"Serial"/"Model" labels anywhere on the
        // page). If a future revision of this form adds one, do NOT reuse the
        // NTC 1-19 device-table coordinates - re-run the full extraction (get_text
        // for labels, get_drawings for the real row/column grid, a filled test
        // render to verify) against this form's own template first.

        return items;
    }
}
