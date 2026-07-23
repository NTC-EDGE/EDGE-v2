using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc104Application (NTC 1-04) onto coordinate positions (X, Y in points)
/// for flat PDF templates using PdfSharp XGraphics overlay.
///
/// Page size: 595.2 x 841.8 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Coordinates measured directly from ntc-1-04.pdf template vector geometry.
/// </summary>
public static class Ntc104FlatPdfOverlayMapper
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

    public static List<TextOverlayItem> MapToOverlayItems(Ntc104Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. TYPE OF APPLICATION
        // Checkbox column x: 61.22 - 85.62
        (double top, double bottom) actionBox = app.TypeOfApplication switch
        {
            TypeOfApplication.New => (210.25, 225.45),
            TypeOfApplication.Renewal => (225.25, 240.45),
            TypeOfApplication.Modification => (240.25, 255.45),
            _ => (210.25, 225.45)
        };
        double actionCheckX = CenterX(61.22, 85.62, "✔", 9, true);
        double actionCheckY = (actionBox.top + actionBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = actionCheckX, Y = actionCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextOverlayItem { X = 89, Y = 266.0, Text = app.ModificationReason, FontSize = 8 });
        }

        if (app.NoOfYears.HasValue)
        {
            string yearsTxt = app.NoOfYears.Value.ToString();
            double yearsX = CenterX(109.62, 134.04, yearsTxt, 8, true);
            items.Add(new TextOverlayItem { X = yearsX, Y = 292.87, Text = yearsTxt, FontSize = 8, IsBold = true });
        }

        // 2. TYPE OF PERMIT / LICENSE / CERTIFICATE
        // Checkbox column x: 327.50 - 351.92
        (double top, double bottom) permitCertBox = app.TypeOfPermitLicenseCert switch
        {
            TypeOfPermitLicenseCert104.ShipStationLicense => (210.25, 225.45),
            TypeOfPermitLicenseCert104.ShipEarthStationLicense => (225.25, 240.45),
            TypeOfPermitLicenseCert104.CargoShipSafetyRadioCertificate => (240.25, 255.45),
            TypeOfPermitLicenseCert104.TemporaryPermit => (255.25, 270.45),
            TypeOfPermitLicenseCert104.FerryingPermit => (270.26, 285.48),
            _ => (210.25, 225.45)
        };
        double permitCertCheckX = CenterX(327.50, 351.92, "✔", 9, true);
        double permitCertCheckY = (permitCertBox.top + permitCertBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = permitCertCheckX, Y = permitCertCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // Vessel Category (Ship 351.73-376.13, Aircraft 466.75-491.17, Others 327.50-351.92 y=300.27)
        (double left, double right, double top, double bottom) vesselBox = app.VesselCategory switch
        {
            VesselCategory.Ship => (351.73, 376.13, 285.27, 300.47),
            VesselCategory.Aircraft => (466.75, 491.17, 285.27, 300.47),
            VesselCategory.Others => (327.50, 351.92, 300.27, 315.47),
            _ => (351.73, 376.13, 285.27, 300.47)
        };
        double vesselCheckX = CenterX(vesselBox.left, vesselBox.right, "✔", 9, true);
        double vesselCheckY = (vesselBox.top + vesselBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = vesselCheckX, Y = vesselCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (app.VesselCategory == VesselCategory.Others && !string.IsNullOrWhiteSpace(app.OtherVesselCategoryDetails))
        {
            items.Add(new TextOverlayItem { X = 356, Y = 326.0, Text = app.OtherVesselCategoryDetails, FontSize = 8 });
        }

        // Trading Route (Domestic 206.48-230.88 y=300.27, International 206.48-230.88 y=315.27)
        (double top, double bottom) routeBox = app.TradingRoute == TradingRoute.Domestic ? (300.27, 315.47) : (315.27, 330.47);
        double routeCheckX = CenterX(206.48, 230.88, "✔", 9, true);
        double routeCheckY = (routeBox.top + routeBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = routeCheckX, Y = routeCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // 3. APPLICANT'S DETAILS
        var a = app.Applicant;
        items.Add(new TextOverlayItem { X = 114, Y = 359.0, Text = a.Name, FontSize = 8, IsBold = true });

        items.Add(new TextOverlayItem { X = 114, Y = 374.0, Text = a.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 380, Y = 374.0, Text = a.Address.Street, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 114, Y = 389.0, Text = a.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 380, Y = 388.0, Text = a.Address.CityMunicipality, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 114, Y = 404.0, Text = a.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 380, Y = 404.0, Text = a.Address.ZipCode, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 114, Y = 419.0, Text = a.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 380, Y = 419.0, Text = a.Email, FontSize = 8 });

        // 4. SHIP DETAILS
        var sh = app.ShipDetails;
        items.Add(new TextOverlayItem { X = 114, Y = 449.0, Text = sh.NameOfShipVessel, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 447, Y = 449.0, Text = sh.CallSign, FontSize = 8, IsBold = true });

        items.Add(new TextOverlayItem { X = 114, Y = 464.0, Text = sh.MmsiNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 447, Y = 464.0, Text = sh.StationLicenseNo, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 114, Y = 479.0, Text = sh.ImoNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 447, Y = 479.0, Text = sh.Validity != default ? sh.Validity.ToString("MM/dd/yy") : "", FontSize = 8 });

        // 5. PARTICULARS OF EQUIPMENT (Up to 5 rows)
        double[] eqRowY = { 527.0, 542.0, 557.0, 572.0, 587.0 };
        for (int i = 0; i < app.Equipment.Count && i < 5; i++)
        {
            var eq = app.Equipment[i];
            double y = eqRowY[i];

            items.Add(new TextOverlayItem { X = 16, Y = y, Text = eq.RadioEquipment, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 114, Y = y, Text = eq.Make, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 235, Y = y, Text = eq.TypeModel, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 356, Y = y, Text = eq.SerialNumber, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 495, Y = y, Text = eq.PowerOutput, FontSize = 8 });
        }

        // 6. PARTICULARS OF OPERATORS (Up to 2 operators side by side)
        if (app.Operators.Count > 0)
        {
            var op1 = app.Operators[0];
            items.Add(new TextOverlayItem { X = 138, Y = 617.0, Text = op1.Name, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 138, Y = 632.0, Text = op1.CertificateNumber, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 138, Y = 646.0, Text = op1.Validity != default ? op1.Validity.ToString("MM/dd/yy") : "", FontSize = 8 });
        }
        if (app.Operators.Count > 1)
        {
            var op2 = app.Operators[1];
            items.Add(new TextOverlayItem { X = 356, Y = 617.0, Text = op2.Name, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 356, Y = 632.0, Text = op2.CertificateNumber, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 356, Y = 646.0, Text = op2.Validity != default ? op2.Validity.ToString("MM/dd/yy") : "", FontSize = 8 });
        }

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(61.6, 302.8, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 737.0, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(110.1, 254.4, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 776.0, Text = dateAccomplishedText, FontSize = 8 });
        }

        // 8. OFFICIAL RECEIPT BOX (x: 375.1 - 544.5, y: 710.0 - 791.7)
        if (app.Payment != null)
        {
            items.Add(new TextOverlayItem { X = 455, Y = 729.0, Text = app.Payment.OrNo, FontSize = 8 });
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextOverlayItem { X = 459, Y = 740.0, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 528, Y = 740.0, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }
            items.Add(new TextOverlayItem { X = 445, Y = 751.0, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                double officerX = CenterX(420.0, 530.0, app.Payment.CollectingOfficer, 8, false);
                items.Add(new TextOverlayItem { X = officerX, Y = 771.0, Text = app.Payment.CollectingOfficer, FontSize = 8 });
            }
        }

        return items;
    }
}
