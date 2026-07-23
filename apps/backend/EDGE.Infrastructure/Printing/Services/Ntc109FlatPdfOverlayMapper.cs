using System.Collections.Generic;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps PurchasePossessSellTransferApplication (NTC 1-09) onto coordinate positions (X, Y in points)
/// for non-fillable or flat PDF templates using PdfSharp XGraphics overlay.
///
/// Page size: 595.2 x 841.8 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Coordinates measured directly from ntc-1-09.pdf template vector geometry.
/// </summary>
public static class Ntc109FlatPdfOverlayMapper
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

    public static List<TextOverlayItem> MapToOverlayItems(PurchasePossessSellTransferApplication app)
    {
        var items = new List<TextOverlayItem>();

        // 1. TYPE OF APPLICATION (Purchase / Possess / Sell/Transfer)
        // Checkbox column x: 80.82 - 104.02
        (double top, double bottom) appTypeBox = app.TypeOfApplicationSpecific switch
        {
            TypeOfApplicationSpecific.Purchase => (216.65, 231.85),
            TypeOfApplicationSpecific.Possess => (231.65, 246.85),
            TypeOfApplicationSpecific.SellTransfer => (246.65, 261.85),
            _ => (216.65, 231.85)
        };
        double appTypeCheckX = CenterX(80.82, 104.02, "✔", 9, true);
        double appTypeCheckY = (appTypeBox.top + appTypeBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = appTypeCheckX, Y = appTypeCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // 2. TYPE OF RADIO SERVICE
        // Column 1: x 264.90 - 288.10; Column 2: x 425.95 - 454.75
        (double left, double right, double top, double bottom) radioServiceBox = app.TypeOfRadioService switch
        {
            TypeOfRadioService.FixedAndLandMobile => (264.90, 288.10, 216.65, 231.85),
            TypeOfRadioService.Aeronautical => (264.90, 288.10, 231.65, 246.85),
            TypeOfRadioService.MaritimePublicPrivateCoastal => (264.90, 288.10, 246.65, 261.85),
            TypeOfRadioService.Broadcast => (425.95, 454.75, 216.65, 231.85),
            TypeOfRadioService.Amateur => (425.95, 454.75, 231.65, 246.85),
            TypeOfRadioService.Other => (425.95, 454.75, 246.65, 261.85),
            _ => (264.90, 288.10, 216.65, 231.85)
        };
        double radioServiceCheckX = CenterX(radioServiceBox.left, radioServiceBox.right, "✔", 9, true);
        double radioServiceCheckY = (radioServiceBox.top + radioServiceBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = radioServiceCheckX, Y = radioServiceCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // 3. NATURE OF SERVICE
        // Checkbox column x: 80.82 - 104.02
        (double top, double bottom) natureBox = app.NatureOfService switch
        {
            NatureOfService.CvPrivate => (299.07, 314.27),
            NatureOfService.CoGovernment => (314.07, 329.27),
            NatureOfService.CpPublicCorrespondence => (329.08, 344.28),
            _ => (299.07, 314.27)
        };
        double natureCheckX = CenterX(80.82, 104.02, "✔", 9, true);
        double natureCheckY = (natureBox.top + natureBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = natureCheckX, Y = natureCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // 4. CLASS OF STATION (Quantity or X)
        var classMap = new Dictionary<string, (double left, double right, double top, double bottom)>
        {
            ["RT"] = (264.90, 288.10, 299.07, 314.27),
            ["ML"] = (333.93, 357.13, 299.07, 314.27),
            ["FC"] = (402.95, 426.15, 299.07, 314.27),
            ["TC"] = (477.58, 500.78, 299.07, 314.27),
            ["FX"] = (264.90, 288.10, 314.07, 329.27),
            ["P"]  = (333.93, 357.13, 314.07, 329.27),
            ["FA"] = (402.95, 426.15, 314.07, 329.27),
            ["FB"] = (264.90, 288.10, 329.08, 344.28),
            ["BC"] = (333.93, 357.13, 329.08, 344.28),
            ["MA"] = (402.95, 426.15, 329.08, 344.28)
        };

        if (app.ClassOfStation != null)
        {
            var stationCounts = new Dictionary<string, int>
            {
                ["RT"] = app.ClassOfStation.RT,
                ["ML"] = app.ClassOfStation.ML,
                ["FC"] = app.ClassOfStation.FC,
                ["TC"] = app.ClassOfStation.TC,
                ["FX"] = app.ClassOfStation.FX,
                ["P"]  = app.ClassOfStation.P,
                ["FA"] = app.ClassOfStation.FA,
                ["FB"] = app.ClassOfStation.FB,
                ["BC"] = app.ClassOfStation.BC,
                ["MA"] = app.ClassOfStation.MA
            };

            foreach (var (code, count) in stationCounts)
            {
                if (count > 0 && classMap.TryGetValue(code, out var box))
                {
                    string txt = count.ToString();
                    double valX = CenterX(box.left, box.right, txt, 8, true);
                    double valY = (box.top + box.bottom) / 2.0;
                    items.Add(new TextOverlayItem { X = valX, Y = valY, Text = txt, FontSize = 8, IsBold = true });
                }
            }

            if (!string.IsNullOrWhiteSpace(app.ClassOfStation.Other))
            {
                items.Add(new TextOverlayItem { X = 504, Y = 341.0, Text = app.ClassOfStation.Other, FontSize = 8 });
            }
        }

        // 5. APPLICANT'S DETAILS
        var a = app.Applicant;
        items.Add(new TextOverlayItem { X = 153, Y = 377.0, Text = a.Name, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 153, Y = 392.0, Text = app.CpcCpcnPaRslNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 430, Y = 392.0, Text = app.Validity != default ? app.Validity.ToString("MM/dd/yy") : "", FontSize = 8 });
        items.Add(new TextOverlayItem { X = 153, Y = 407.0, Text = a.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 430, Y = 407.0, Text = a.Address.Street, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 153, Y = 422.0, Text = a.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 430, Y = 422.0, Text = a.Address.CityMunicipality, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 153, Y = 437.0, Text = a.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 430, Y = 437.0, Text = a.Address.ZipCode, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 153, Y = 452.0, Text = a.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 430, Y = 452.0, Text = a.Email, FontSize = 8 });

        // 6. PARTICULARS OF PROPOSED STATION/EQUIPMENT
        var st = app.ProposedStation;
        var eq = app.Equipment.FirstOrDefault() ?? new Equipment();

        string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
            ? $"{eq.Make} {eq.TypeModel}".Trim()
            : eq.RadioEquipment;

        items.Add(new TextOverlayItem { X = 176, Y = 482.0, Text = st.ExactLocation, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 458, Y = 482.0, Text = makeModel, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 176, Y = 497.0, Text = st.Longitude, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 458, Y = 497.0, Text = eq.SerialNumber, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 176, Y = 512.0, Text = st.Latitude, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 458, Y = 512.0, Text = st.BwEmission, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 176, Y = 527.0, Text = st.PointsOfCommServiceArea, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 458, Y = 527.0, Text = eq.PowerOutput, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 176, Y = 542.0, Text = st.AssignedFreq, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 458, Y = 542.0, Text = eq.FrequencyRange, FontSize = 8 });

        // 7. SOURCE OF EQUIPMENT
        var src = app.SourceOfEquipment;
        items.Add(new TextOverlayItem { X = 153, Y = 572.0, Text = src.NameOfDealer, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 458, Y = 572.0, Text = src.OrInvoiceNo, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 153, Y = 587.0, Text = src.AuthorizedSellerBuyer, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 458, Y = 587.0, Text = src.PermitRslNo, FontSize = 8 });

        // 8. INTENDED USE OF EQUIPMENT
        // Left col boxes: x 57.83 - 81.03; Right col boxes: x 241.88 - 265.11
        (double left, double right, double top, double bottom) intendedBox = app.IntendedUse switch
        {
            IntendedUse.NewRadioStation => (57.83, 81.03, 607.55, 622.75),
            IntendedUse.AdditionalEquipment => (241.88, 265.11, 607.55, 622.75),
            IntendedUse.AdditionalRadioStation => (57.83, 81.03, 622.55, 637.75),
            IntendedUse.Storage => (241.88, 265.11, 622.55, 637.75),
            IntendedUse.ChangeOfEquipment => (57.83, 81.03, 637.55, 652.75),
            IntendedUse.Other => (241.88, 265.11, 637.55, 652.75),
            _ => (57.83, 81.03, 607.55, 622.75)
        };
        double intendedCheckX = CenterX(intendedBox.left, intendedBox.right, "✔", 9, true);
        double intendedCheckY = (intendedBox.top + intendedBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = intendedCheckX, Y = intendedCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (app.IntendedUse == IntendedUse.Storage && !string.IsNullOrWhiteSpace(st.ExactLocation))
        {
            items.Add(new TextOverlayItem { X = 338, Y = 635.0, Text = st.ExactLocation, FontSize = 8 });
        }
        else if (app.IntendedUse == IntendedUse.Other && !string.IsNullOrWhiteSpace(st.Others))
        {
            items.Add(new TextOverlayItem { X = 338, Y = 650.0, Text = st.Others, FontSize = 8 });
        }

        // 9. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(57.83, 357.12, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 738.0, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(126.85, 288.10, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 780.0, Text = dateAccomplishedText, FontSize = 8 });
        }

        // 10. OFFICIAL RECEIPT BOX (y: 710.2 - 792.4, x: 373.6 - 543.6)
        if (app.Payment != null)
        {
            items.Add(new TextOverlayItem { X = 450, Y = 728, Text = app.Payment.OrNo, FontSize = 8 });
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextOverlayItem { X = 460, Y = 739, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 514, Y = 739, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }
            items.Add(new TextOverlayItem { X = 435, Y = 751, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });
            items.Add(new TextOverlayItem { X = 430, Y = 769, Text = app.Payment.CollectingOfficer, FontSize = 8 });
        }

        return items;
    }
}
