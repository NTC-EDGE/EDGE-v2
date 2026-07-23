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
            {
                items.Add(new TextOverlayItem { X = 445.0, Y = 717.0, Text = app.Payment.OrNo, FontSize = 7.5 });
            }
            if (app.Payment.OrDate != default)
            {
                string dateStr = app.Payment.OrDate.ToString("MM/dd/yyyy");
                string[] parts = dateStr.Split('/');
                if (parts.Length == 3)
                {
                    items.Add(new TextOverlayItem { X = 445.0, Y = 732.0, Text = $"{parts[0]}/{parts[1]}", FontSize = 7.5 });
                    items.Add(new TextOverlayItem { X = 525.0, Y = 732.0, Text = parts[2].Length == 4 ? parts[2].Substring(2) : parts[2], FontSize = 7.5 });
                }
                else
                {
                    items.Add(new TextOverlayItem { X = 445.0, Y = 732.0, Text = dateStr, FontSize = 7.5 });
                }
            }
            if (app.Payment.Amount > 0)
            {
                items.Add(new TextOverlayItem { X = 445.0, Y = 747.0, Text = app.Payment.Amount.ToString("N2"), FontSize = 7.5 });
            }
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                double officerX = CenterX(380.0, 560.0, app.Payment.CollectingOfficer, 7.5, false);
                items.Add(new TextOverlayItem { X = officerX, Y = 762.0, Text = app.Payment.CollectingOfficer, FontSize = 7.5 });
            }
        }



        return items;
    }
}
