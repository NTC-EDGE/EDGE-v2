using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps CertificateOfRegistrationApplication (NTC 1-19) onto precise coordinate positions (X, Y in points)
/// for non-fillable (flat) PDF templates using PdfSharp XGraphics overlay.
///
/// Coordinates verified against the actual flat PDF's vector table geometry (row/column border
/// rects extracted via PyMuPDF) and label text positions, top-down origin (Y=0 at top of page),
/// matching PdfSharp XGraphics' default coordinate system. Page size: 595.2 x 841.8 pt (A4).
/// </summary>
public static class Ntc119FlatPdfOverlayMapper
{
    // Rough average character width as a fraction of font size, for Arial/Helvetica-style fonts.
    // Used only to center short overlay strings (names, dates) within a known box width — not
    // exact glyph metrics, but close enough at 8pt for this form's field widths.
    private const double RegularCharWidthFactor = 0.52;
    private const double BoldCharWidthFactor = 0.62;

    private static double EstimateTextWidth(string text, double fontSize, bool isBold)
    {
        if (string.IsNullOrEmpty(text)) return 0;
        return text.Length * fontSize * (isBold ? BoldCharWidthFactor : RegularCharWidthFactor);
    }

    /// <summary>Left-edge X that horizontally centers <paramref name="text"/> within [boxLeft, boxRight].</summary>
    private static double CenterX(double boxLeft, double boxRight, string text, double fontSize, bool isBold)
    {
        double width = EstimateTextWidth(text, fontSize, isBold);
        double boxCenter = (boxLeft + boxRight) / 2.0;
        return boxCenter - (width / 2.0);
    }

    public static List<TextOverlayItem> MapToOverlayItems(CertificateOfRegistrationApplication app)
    {
        var items = new List<TextOverlayItem>();

        // 1. Equipment Device Type Checkmark (X)
        // Checkbox cell is a bordered column at x: 74.9-96.9 pt. Row height is 15.03 pt,
        // starting at y=227.25 (row 0 top). Horizontally centered via CenterX; Y is the
        // vertical center of the row.
        const double checkboxCellLeft = 74.9, checkboxCellRight = 96.9;
        double checkX = CenterX(checkboxCellLeft, checkboxCellRight, "X", 9, true);
        double checkY = app.EquipmentDeviceType switch
        {
            EquipmentDeviceType.WdnIndoor => 234.9,
            EquipmentDeviceType.Srd => 249.9,
            EquipmentDeviceType.Rfid => 264.9,
            EquipmentDeviceType.Srrs => 279.9,
            EquipmentDeviceType.PublicTrunkedRadioMobilePortable => 294.9,
            _ => 234.9
        };
        items.Add(new TextOverlayItem { X = checkX, Y = checkY, Text = "X", FontSize = 9, IsBold = true });

        // 2. Applicant Details
        // Row baselines = row_bottom - 3 (matches label text baselines exactly against the
        // table's actual row rects). Column 1 value cell: x 143.25-304.5. Column 2 value cell:
        // x 373.3-570 (Validity's column 2 starts later, at x 419.35, since its label is longer).
        // NOTE: the "Applicant" row's own label/value divider sits at x=96.9 (its label is short,
        // "Applicant" vs. e.g. "Unit/Rm/Bldg No."), not at 143.25 like the other rows below it —
        // so its value needs its own, further-left X to sit at the same small padding-from-divider
        // the other rows have, rather than inheriting their X and looking over-indented.
        var a = app.Applicant;
        items.Add(new TextOverlayItem { X = 100, Y = 336.7, Text = a.Name, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 145, Y = 351.7, Text = a.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 378, Y = 351.7, Text = a.Address.Street, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 145, Y = 366.7, Text = a.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 378, Y = 366.7, Text = a.Address.CityMunicipality, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 145, Y = 381.7, Text = a.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 378, Y = 381.7, Text = a.Address.ZipCode, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 145, Y = 396.7, Text = a.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 378, Y = 396.7, Text = a.Email, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 145, Y = 411.7, Text = app.PermitToImportNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 378, Y = 411.7, Text = app.InvoiceNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 145, Y = 426.7, Text = app.CpcnPaRslNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 422, Y = 426.7, Text = app.Validity != default ? app.Validity.ToString("MM/dd/yy") : "", FontSize = 8 });

        // 3. Particulars of Equipment & Devices
        // 11 data rows total (y: 459.5-624.25), each 15.03 pt tall. Baseline = row_bottom - 3.
        // Column boundaries: col1 (Make/Type/Model) 28.2-211.98, col2 (Quantity) 211.98-396.03,
        // col3 (Serial Number) 396.03-570. Quantity is centered in col2 rather than left-aligned,
        // matching the "Quantity" header's own centered position in that column.
        const double quantityColLeft = 211.98, quantityColRight = 396.03;
        double startRowY = 471.2;
        double rowHeight = 15.03;
        for (int i = 0; i < app.Devices.Count && i < 11; i++)
        {
            var dev = app.Devices[i];
            double currentY = startRowY + (i * rowHeight);
            string quantityText = dev.Quantity.ToString();
            double quantityX = CenterX(quantityColLeft, quantityColRight, quantityText, 8, false);
            items.Add(new TextOverlayItem { X = 35, Y = currentY, Text = dev.MakeTypeModel, FontSize = 8 });
            items.Add(new TextOverlayItem { X = quantityX, Y = currentY, Text = quantityText, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 410, Y = currentY, Text = dev.SerialNumber, FontSize = 8 });
        }

        // Summary Total Quantity — TOTAL row is y: 624.55-639.75, baseline = 639.75 - 3 = 636.6
        string totalQuantityText = app.TotalQuantity.ToString();
        double totalQuantityX = CenterX(quantityColLeft, quantityColRight, totalQuantityText, 8, true);
        items.Add(new TextOverlayItem { X = totalQuantityX, Y = 636.6, Text = totalQuantityText, FontSize = 8, IsBold = true });

        // 4. Signatures & Official Receipt Box
        // Both boxes share almost the same horizontal center (~201pt) even though they're
        // different widths, so each string is centered within its own box rather than sharing
        // one fixed X — that's what keeps them visually aligned with each other.
        const double signatureBoxLeft = 51.2, signatureBoxRight = 350.52;   // "Carmela D. Uy" box
        const double dateBoxLeft = 126.75, dateBoxRight = 276.4;           // "Date Accomplished" box

        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(signatureBoxLeft, signatureBoxRight, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 730, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(dateBoxLeft, dateBoxRight, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 775, Text = dateAccomplishedText, FontSize = 8 });
        }

        // OR box is a flattened image (x: 374-542.7, y: 702.8-787.1) — no live text/form fields
        // exist here, so these are overlay-only positions calibrated against the blank
        // writing lines baked into that image.
        if (app.Payment != null)
        {
            items.Add(new TextOverlayItem { X = 450, Y = 723, Text = app.Payment.OrNo, FontSize = 8 });
            // The printed form reads "DATE: ______, 20____" — two separate blanks, not one.
            // DATE label text runs to pdf_x ~447.5 (measured from the template image), so the
            // MM/DD blank starts at 450; the "20" is baked into the template around pdf_x
            // 497-510, and the 2-digit-year blank after it runs roughly 510-536.
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextOverlayItem { X = 460, Y = 734, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 514, Y = 734, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }
            items.Add(new TextOverlayItem { X = 435, Y = 747, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });
            items.Add(new TextOverlayItem { X = 430, Y = 767, Text = app.Payment.CollectingOfficer, FontSize = 8 });
        }

        return items;
    }
}
