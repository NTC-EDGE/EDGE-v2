using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc114Application (NTC 1-14 - Application for Temporary Permit to Propagate/Demonstrate)
/// onto coordinate positions (X, Y in points) for flat PDF templates using PdfSharp XGraphics overlay.
/// Page size: 595.2 x 841.8 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Baselines calibrated from PDF cell rect bounds (y_bottom - 3.0).
/// </summary>
public static class Ntc114FlatPdfOverlayMapper
{
    private const string CheckmarkChar = "\u2714";
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

    public static List<TextOverlayItem> MapToOverlayItems(Ntc114Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. NATURE OF SERVICE CHECKBOXES
        switch (app.NatureOfService)
        {
            case NatureOfService114.CV:
                items.Add(new TextOverlayItem { X = 83.0, Y = 233.6, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case NatureOfService114.CO:
                items.Add(new TextOverlayItem { X = 83.0, Y = 248.6, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case NatureOfService114.CP:
                items.Add(new TextOverlayItem { X = 83.0, Y = 263.6, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case NatureOfService114.Others:
                items.Add(new TextOverlayItem { X = 129.0, Y = 278.7, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                if (!string.IsNullOrWhiteSpace(app.NatureOfServiceOther))
                {
                    items.Add(new TextOverlayItem { X = 145.0, Y = 278.7, Text = app.NatureOfServiceOther, FontSize = 7.5 });
                }
                break;
        }

        // 2. TYPE OF RADIO SERVICE CHECKBOXES
        switch (app.TypeOfRadioService)
        {
            case TypeOfRadioService114.FixedAndLandMobile:
                items.Add(new TextOverlayItem { X = 83.0, Y = 308.7, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case TypeOfRadioService114.Aeronautical:
                items.Add(new TextOverlayItem { X = 83.0, Y = 323.7, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case TypeOfRadioService114.Broadcast:
                items.Add(new TextOverlayItem { X = 83.0, Y = 338.7, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case TypeOfRadioService114.Others:
                items.Add(new TextOverlayItem { X = 83.0, Y = 353.7, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                if (!string.IsNullOrWhiteSpace(app.TypeOfRadioServiceOther))
                {
                    items.Add(new TextOverlayItem { X = 101.0, Y = 368.7, Text = app.TypeOfRadioServiceOther, FontSize = 7.5 });
                }
                break;
        }

        // 3. CLASS OF STATION (Units count per station type)
        var cs = app.ClassOfStation;
        if (cs.RT > 0) items.Add(new TextOverlayItem { X = 334.0, Y = 233.6, Text = cs.RT.ToString(), FontSize = 8 });
        if (cs.FX > 0) items.Add(new TextOverlayItem { X = 334.0, Y = 248.6, Text = cs.FX.ToString(), FontSize = 8 });
        if (cs.FB > 0) items.Add(new TextOverlayItem { X = 334.0, Y = 263.6, Text = cs.FB.ToString(), FontSize = 8 });
        if (cs.ML > 0) items.Add(new TextOverlayItem { X = 334.0, Y = 278.7, Text = cs.ML.ToString(), FontSize = 8 });
        if (cs.P > 0)  items.Add(new TextOverlayItem { X = 334.0, Y = 293.7, Text = cs.P.ToString(), FontSize = 8 });
        if (cs.BC > 0) items.Add(new TextOverlayItem { X = 334.0, Y = 308.7, Text = cs.BC.ToString(), FontSize = 8 });

        if (cs.FA > 0) items.Add(new TextOverlayItem { X = 403.0, Y = 233.6, Text = cs.FA.ToString(), FontSize = 8 });
        if (cs.MA > 0) items.Add(new TextOverlayItem { X = 403.0, Y = 248.6, Text = cs.MA.ToString(), FontSize = 8 });
        if (cs.TC > 0) items.Add(new TextOverlayItem { X = 403.0, Y = 263.6, Text = cs.TC.ToString(), FontSize = 8 });
        if (!string.IsNullOrWhiteSpace(cs.Other))
        {
            items.Add(new TextOverlayItem { X = 426.0, Y = 278.7, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            items.Add(new TextOverlayItem { X = 423.0, Y = 293.7, Text = cs.Other, FontSize = 7.5 });
        }

        // 4. APPLICANT DETAILS
        var a = app.Applicant;
        if (!string.IsNullOrWhiteSpace(a.Name)) items.Add(new TextOverlayItem { X = 123.0, Y = 413.1, Text = a.Name, FontSize = 8, IsBold = true });
        if (!string.IsNullOrWhiteSpace(a.Address.UnitRoomBldgNo)) items.Add(new TextOverlayItem { X = 123.0, Y = 428.1, Text = a.Address.UnitRoomBldgNo, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(a.Address.Street)) items.Add(new TextOverlayItem { X = 399.0, Y = 428.1, Text = a.Address.Street, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(a.Address.Barangay)) items.Add(new TextOverlayItem { X = 123.0, Y = 443.1, Text = a.Address.Barangay, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(a.Address.CityMunicipality)) items.Add(new TextOverlayItem { X = 399.0, Y = 443.1, Text = a.Address.CityMunicipality, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(a.Address.Province)) items.Add(new TextOverlayItem { X = 123.0, Y = 458.1, Text = a.Address.Province, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(a.Address.ZipCode)) items.Add(new TextOverlayItem { X = 399.0, Y = 458.1, Text = a.Address.ZipCode, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(a.ContactNumber)) items.Add(new TextOverlayItem { X = 123.0, Y = 473.1, Text = a.ContactNumber, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(a.Email)) items.Add(new TextOverlayItem { X = 399.0, Y = 473.1, Text = a.Email, FontSize = 7.5 });

        // 5. STATION PARTICULARS
        var st = app.ProposedStation;
        if (!string.IsNullOrWhiteSpace(st.ExactLocation)) items.Add(new TextOverlayItem { X = 123.0, Y = 518.1, Text = st.ExactLocation, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(st.Longitude)) items.Add(new TextOverlayItem { X = 123.0, Y = 533.1, Text = st.Longitude, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(st.Latitude)) items.Add(new TextOverlayItem { X = 123.0, Y = 548.1, Text = st.Latitude, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(st.PointsOfCommServiceArea)) items.Add(new TextOverlayItem { X = 123.0, Y = 563.1, Text = st.PointsOfCommServiceArea, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(st.AssignedFreq)) items.Add(new TextOverlayItem { X = 123.0, Y = 578.2, Text = st.AssignedFreq, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(st.BwEmission)) items.Add(new TextOverlayItem { X = 123.0, Y = 593.2, Text = st.BwEmission, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(st.DataRate)) items.Add(new TextOverlayItem { X = 123.0, Y = 608.2, Text = st.DataRate, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(st.Others)) items.Add(new TextOverlayItem { X = 123.0, Y = 623.2, Text = st.Others, FontSize = 7.5 });

        // 6. EQUIPMENT PARTICULARS
        var eq = app.Equipment;
        string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
            ? $"{eq.Make} {eq.TypeModel}".Trim()
            : eq.RadioEquipment;

        if (!string.IsNullOrWhiteSpace(makeModel)) items.Add(new TextOverlayItem { X = 422.0, Y = 518.1, Text = makeModel, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(eq.SerialNumber)) items.Add(new TextOverlayItem { X = 422.0, Y = 533.1, Text = eq.SerialNumber, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(eq.PowerOutput)) items.Add(new TextOverlayItem { X = 422.0, Y = 548.1, Text = eq.PowerOutput, FontSize = 7.5 });
        if (!string.IsNullOrWhiteSpace(eq.FrequencyRange)) items.Add(new TextOverlayItem { X = 422.0, Y = 563.1, Text = eq.FrequencyRange, FontSize = 7.5 });

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(52.0, 351.3, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 728.2, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }

        if (app.Declaration.DateAccomplished != default)
        {
            string dateText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(121.0, 282.3, dateText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 773.2, Text = dateText, FontSize = 8 });
        }

        // 8. PAYMENT / OR BOX
        if (app.Payment != null)
        {
            if (!string.IsNullOrWhiteSpace(app.Payment.OrNo))
                // FIX: X was 432 (under the "NO.:" label, which runs to ~453.6) and
                // Y was 723.5 (sitting on top of the row's underline at 721.1 instead
                // of just above it). Measured directly off the template's own
                // underline in the rendered PDF: line at Y=721.1, X-range 455.8-533.5.
                // Baseline = underline_Y - 3.0 (matches this file's own convention).
                items.Add(new TextOverlayItem { X = 458.0, Y = 718.0, Text = app.Payment.OrNo, FontSize = 7.5 });

            if (app.Payment.OrDate != default)
            {
                string dateStr = app.Payment.OrDate.ToString("MM/dd/yyyy");
                string[] parts = dateStr.Split('/');
                if (parts.Length == 3)
                {
                    // FIX: measured directly off the template's own underlines this
                    // time (not OCR'd label text, which was throwing off both earlier
                    // attempts). The month/day blank is a real underline at Y=732.6,
                    // X=455.5-497.8. The year blank is a SEPARATE underline at the
                    // same Y, X=513.6-533.8 — old X=530 sat at the far right edge of
                    // that blank instead of left-aligned after "20". Baseline = 732.6-3.0.
                    items.Add(new TextOverlayItem { X = 459.0, Y = 729.5, Text = $"{parts[0]}/{parts[1]}", FontSize = 7.5 });
                    items.Add(new TextOverlayItem { X = 516.0, Y = 729.5, Text = parts[2].Length == 4 ? parts[2].Substring(2) : parts[2], FontSize = 7.5 });
                }
                else
                {
                    items.Add(new TextOverlayItem { X = 459.0, Y = 729.5, Text = dateStr, FontSize = 7.5 });
                }
            }

            if (app.Payment.Amount > 0)
                // FIX: the AMOUNT row's underline measures at Y=744.0 (a single clean
                // run from X=428.2-533.8, right after the "AMOUNT:" label which ends
                // ~426.7 — so X=432 was already fine). Baseline = 744.0 - 3.0 = 741.0.
                items.Add(new TextOverlayItem { X = 432.0, Y = 741.0, Text = app.Payment.Amount.ToString("N2"), FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                // FIX: the signature underline measures at Y=762.6, X=420.0-513.1
                // (was assumed 405.0-535.0). Baseline = 762.6 - 3.0 = 759.6.
                double officerX = CenterX(420.0, 513.1, app.Payment.CollectingOfficer, 7.5, false);
                items.Add(new TextOverlayItem { X = officerX, Y = 759.6, Text = app.Payment.CollectingOfficer, FontSize = 7.5 });
            }
        }

        return items;
    }
}
