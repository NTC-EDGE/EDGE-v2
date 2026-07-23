using System.Collections.Generic;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps ConstructionPermitApplication (NTC 1-11) onto coordinate positions (X, Y in points)
/// for non-fillable or flat PDF templates using PdfSharp XGraphics overlay.
///
/// Page size: 595.2 x 841.8 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Coordinates measured directly from ntc-1-11.pdf template vector geometry.
/// </summary>
public static class Ntc111FlatPdfOverlayMapper
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

    public static List<TextOverlayItem> MapToOverlayItems(ConstructionPermitApplication app)
    {
        var items = new List<TextOverlayItem>();

        // 1. TYPE OF APPLICATION
        // Subtype: Construction Permit vs Radio Station License
        (double top, double bottom) subtypeBox = app.PermitSubtype switch
        {
            PermitSubtype.ConstructionPermit => (268.04, 283.27),
            PermitSubtype.RadioStationLicense => (283.07, 298.27),
            _ => (268.04, 283.27)
        };
        double subtypeCheckX = CenterX(76.62, 99.82, "✔", 9, true);
        double subtypeCheckY = (subtypeBox.top + subtypeBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = subtypeCheckX, Y = subtypeCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // Application Action: New / Renewal / Modification
        (double top, double bottom) actionBox = app.TypeOfApplication switch
        {
            TypeOfApplication.New => (200.85, 216.05),
            TypeOfApplication.Renewal => (215.85, 231.05),
            TypeOfApplication.Modification => (230.85, 246.05),
            _ => (200.85, 216.05)
        };
        double actionCheckX = CenterX(76.62, 99.82, "✔", 9, true);
        double actionCheckY = (actionBox.top + actionBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = actionCheckX, Y = actionCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextOverlayItem { X = 102, Y = 256.0, Text = app.ModificationReason, FontSize = 8 });
        }

        // 2. TYPE OF RADIO SERVICE
        // Left col: 271.30 - 294.50; Right col: 432.35 - 455.55
        (double left, double right, double top, double bottom) radioServiceBox = app.TypeOfRadioService switch
        {
            TypeOfRadioService.FixedAndLandMobile => (271.30, 294.50, 200.85, 216.05),
            TypeOfRadioService.Aeronautical => (271.30, 294.50, 215.85, 231.05),
            TypeOfRadioService.MaritimePublicPrivateCoastal => (271.30, 294.50, 230.85, 246.05),
            TypeOfRadioService.Broadcast => (432.35, 455.55, 200.85, 216.05),
            TypeOfRadioService.Other => (432.35, 455.55, 215.85, 231.05),
            _ => (271.30, 294.50, 200.85, 216.05)
        };
        double radioServiceCheckX = CenterX(radioServiceBox.left, radioServiceBox.right, "✔", 9, true);
        double radioServiceCheckY = (radioServiceBox.top + radioServiceBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = radioServiceCheckX, Y = radioServiceCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // 3. NATURE OF SERVICE & NO. OF YEARS
        // No. of Years box: x 145.65 - 168.85, y 298.07 - 313.27
        if (app.NoOfYears.HasValue)
        {
            string yearsTxt = app.NoOfYears.Value.ToString();
            double yearsX = CenterX(145.65, 168.85, yearsTxt, 8, true);
            items.Add(new TextOverlayItem { X = yearsX, Y = 305.67, Text = yearsTxt, FontSize = 8, IsBold = true });
        }

        // Nature of Service checkbox column x: 76.62 - 99.82
        (double top, double bottom) natureBox = app.NatureOfService switch
        {
            NatureOfService.CvPrivate => (328.08, 343.28),
            NatureOfService.CoGovernment => (343.08, 358.28),
            NatureOfService.CpPublicCorrespondence => (358.07, 373.30),
            _ => (328.08, 343.28)
        };
        double natureCheckX = CenterX(76.62, 99.82, "✔", 9, true);
        double natureCheckY = (natureBox.top + natureBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = natureCheckX, Y = natureCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // 4. CLASS OF STATION (Quantity or X)
        var classMap = new Dictionary<string, (double left, double right, double top, double bottom)>
        {
            ["RT"] = (271.30, 294.50, 313.07, 328.27),
            ["ML"] = (340.33, 363.53, 313.07, 328.27),
            ["FC"] = (409.35, 432.55, 313.07, 328.27),
            ["TC"] = (478.38, 501.58, 313.07, 328.27),
            ["FX"] = (271.30, 294.50, 328.08, 343.28),
            ["P"]  = (340.33, 363.53, 328.08, 343.28),
            ["FA"] = (409.35, 432.55, 328.08, 343.28),
            ["FB"] = (271.30, 294.50, 343.08, 358.28),
            ["BC"] = (340.33, 363.53, 343.08, 358.28),
            ["MA"] = (409.35, 432.55, 343.08, 358.28)
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
                items.Add(new TextOverlayItem { X = 505, Y = 355.0, Text = app.ClassOfStation.Other, FontSize = 8 });
            }
        }

        // 5. APPLICANT'S DETAILS
        var a = app.Applicant;
        items.Add(new TextOverlayItem { X = 126, Y = 404.0, Text = a.Name, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 126, Y = 419.0, Text = a.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 413, Y = 419.0, Text = a.Address.Street, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 126, Y = 434.0, Text = a.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 413, Y = 434.0, Text = a.Address.CityMunicipality, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 126, Y = 449.0, Text = a.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 413, Y = 449.0, Text = a.Address.ZipCode, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 126, Y = 464.0, Text = a.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 413, Y = 464.0, Text = a.Email, FontSize = 8 });

        // 6. PARTICULARS OF STATION / EQUIPMENT / ANTENNA
        var st = app.Stations.FirstOrDefault() ?? new Station();
        var eq = app.Equipment.FirstOrDefault() ?? new Equipment();
        var ant = st.Antenna ?? new Antenna();

        string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
            ? $"{eq.Make} {eq.TypeModel}".Trim()
            : eq.RadioEquipment;

        items.Add(new TextOverlayItem { X = 126, Y = 509.0, Text = st.ExactLocation, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 436, Y = 509.0, Text = makeModel, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 126, Y = 524.0, Text = st.Longitude, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 275, Y = 524.0, Text = st.Latitude, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 436, Y = 524.0, Text = eq.SerialNumber, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 126, Y = 544.0, Text = st.PointsOfCommServiceArea, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 436, Y = 539.0, Text = eq.PowerOutput, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 436, Y = 554.0, Text = eq.FrequencyRange, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 126, Y = 569.0, Text = st.AssignedFreq, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 126, Y = 584.0, Text = st.BwEmission, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 390, Y = 584.0, Text = ant.Type, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 126, Y = 599.0, Text = st.Configuration, FontSize = 8 });
        if (ant.HeightM > 0)
        {
            items.Add(new TextOverlayItem { X = 390, Y = 599.0, Text = ant.HeightM.ToString("F1"), FontSize = 8 });
        }
        if (ant.GainDbi > 0)
        {
            items.Add(new TextOverlayItem { X = 505, Y = 599.0, Text = ant.GainDbi.ToString("F1"), FontSize = 8 });
        }

        items.Add(new TextOverlayItem { X = 126, Y = 614.0, Text = st.DataRate, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 275, Y = 614.0, Text = st.CallSign, FontSize = 8 });
        if (ant.DirectivityDegrees > 0)
        {
            items.Add(new TextOverlayItem { X = 390, Y = 614.0, Text = $"{ant.DirectivityDegrees:F0}°", FontSize = 8 });
        }
        if (!string.IsNullOrWhiteSpace(ant.Polarization))
        {
            items.Add(new TextOverlayItem { X = 390, Y = 629.0, Text = ant.Polarization, FontSize = 8 });
        }
        if (ant.BeamwidthDegrees > 0)
        {
            items.Add(new TextOverlayItem { X = 390, Y = 644.0, Text = $"{ant.BeamwidthDegrees:F0}°", FontSize = 8 });
        }

        items.Add(new TextOverlayItem { X = 126, Y = 629.0, Text = st.RslNo, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 126, Y = 644.0, Text = st.Validity != default ? st.Validity.ToString("MM/dd/yy") : "", FontSize = 8 });

        if (!string.IsNullOrWhiteSpace(st.Others))
        {
            string notes = st.Others.Length > 45 ? st.Others.Substring(0, 42) + "..." : st.Others;
            items.Add(new TextOverlayItem { X = 126, Y = 659.0, Text = notes, FontSize = 8 });
        }
        if (!string.IsNullOrWhiteSpace(ant.Diameter))
        {
            items.Add(new TextOverlayItem { X = 460, Y = 659.0, Text = ant.Diameter, FontSize = 8 });
        }

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(53.60, 363.52, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 743.0, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(145.65, 271.50, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 785.0, Text = dateAccomplishedText, FontSize = 8 });
        }

        // 8. OFFICIAL RECEIPT BOX (y: 717.0 - 781.0, x: 396.0 - 531.9)
        if (app.Payment != null)
        {
            items.Add(new TextOverlayItem { X = 456, Y = 730, Text = app.Payment.OrNo, FontSize = 8 });
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextOverlayItem { X = 464, Y = 739, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 508, Y = 739, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }
            items.Add(new TextOverlayItem { X = 444, Y = 750, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });
            items.Add(new TextOverlayItem { X = 440, Y = 771, Text = app.Payment.CollectingOfficer, FontSize = 8 });
        }

        return items;
    }
}
