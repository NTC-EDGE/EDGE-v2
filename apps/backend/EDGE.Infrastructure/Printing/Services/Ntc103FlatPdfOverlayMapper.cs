using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc103Application (NTC 1-03) onto coordinate positions (X, Y in points)
/// for flat PDF templates using PdfSharp XGraphics overlay.
///
/// Page size: 595.2 x 841.8 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Coordinates measured directly from ntc-1-03.pdf template vector geometry.
/// </summary>
public static class Ntc103FlatPdfOverlayMapper
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

    public static List<TextOverlayItem> MapToOverlayItems(Ntc103Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. TYPE OF APPLICATION
        // Checkbox column x: 86.82 - 110.02
        (double top, double bottom) actionBox = app.TypeOfApplication switch
        {
            TypeOfApplication.New => (224.85, 240.05),
            TypeOfApplication.Renewal => (239.85, 255.05),
            TypeOfApplication.Modification => (254.85, 270.05),
            _ => (224.85, 240.05)
        };
        double actionCheckX = CenterX(86.82, 110.02, "✔", 9, true);
        double actionCheckY = (actionBox.top + actionBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = actionCheckX, Y = actionCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextOverlayItem { X = 114, Y = 281.0, Text = app.ModificationReason, FontSize = 8 });
        }

        if (app.NoOfYears.HasValue)
        {
            string yearsTxt = app.NoOfYears.Value.ToString();
            double yearsX = CenterX(132.85, 156.05, yearsTxt, 8, true);
            items.Add(new TextOverlayItem { X = yearsX, Y = 352.48, Text = yearsTxt, FontSize = 8, IsBold = true });
        }

        // 2. TYPE OF PERMIT / LICENSE / CERTIFICATE
        // Checkbox column x: 247.88 - 271.08
        (double top, double bottom) permitCertBox = app.TypeOfPermitLicenseCert switch
        {
            TypeOfPermitLicenseCert103.AmateurRadioOperatorCertificate => (239.85, 255.05),
            TypeOfPermitLicenseCert103.AmateurRadioStationLicense => (254.85, 270.05),
            TypeOfPermitLicenseCert103.ClubRadioStationLicense => (284.85, 300.07),
            TypeOfPermitLicenseCert103.TemporaryPermitForeignVisitor => (329.88, 345.08),
            TypeOfPermitLicenseCert103.SpecialPermitVanityCallSign => (344.88, 360.08),
            _ => (239.85, 255.05)
        };
        double permitCertCheckX = CenterX(247.88, 271.08, "✔", 9, true);
        double permitCertCheckY = (permitCertBox.top + permitCertBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = permitCertCheckX, Y = permitCertCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (!string.IsNullOrWhiteSpace(app.NameOfClub))
        {
            items.Add(new TextOverlayItem { X = 344, Y = 311.0, Text = app.NameOfClub, FontSize = 8 });
        }
        if (!string.IsNullOrWhiteSpace(app.AssignedFreq))
        {
            items.Add(new TextOverlayItem { X = 344, Y = 326.0, Text = app.AssignedFreq, FontSize = 8 });
        }
        if (!string.IsNullOrWhiteSpace(app.PreferredCallSigns))
        {
            items.Add(new TextOverlayItem { X = 367, Y = 371.0, Text = app.PreferredCallSigns, FontSize = 8 });
        }

        // 3. CLASS OF STATION
        // Checkbox column x: 454.95 - 478.15
        (double top, double bottom) classBox = app.ClassOfStation switch
        {
            ClassOfStationAmateur.ClassA => (224.85, 240.05),
            ClassOfStationAmateur.ClassB => (239.85, 255.05),
            ClassOfStationAmateur.ClassC => (254.85, 270.05),
            ClassOfStationAmateur.ClassD => (269.85, 285.05),
            _ => (224.85, 240.05)
        };
        double classCheckX = CenterX(454.95, 478.15, "✔", 9, true);
        double classCheckY = (classBox.top + classBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = classCheckX, Y = classCheckY, Text = "✔", FontSize = 9, IsBold = true });

        // 4. APPLICANT'S DETAILS
        var p = app.ApplicantPerson;
        items.Add(new TextOverlayItem { X = 114, Y = 410.0, Text = p.LastName, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 459, Y = 410.0, Text = p.DateOfBirth.ToString("MM/dd/yy"), FontSize = 8 });

        items.Add(new TextOverlayItem { X = 114, Y = 425.0, Text = p.FirstName, FontSize = 8, IsBold = true });

        // Sex (Male 385.93-432.15, Female 477.95-524.17)
        var sexBox = p.Sex == Sex.Male ? (left: 385.93, right: 432.15) : (left: 477.95, right: 524.17);
        double sexCheckX = CenterX(sexBox.left, sexBox.right, "✔", 9, true);
        items.Add(new TextOverlayItem { X = sexCheckX, Y = 421.50, Text = "✔", FontSize = 9, IsBold = true });

        items.Add(new TextOverlayItem { X = 114, Y = 440.0, Text = p.MiddleName, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 390, Y = 440.0, Text = p.Nationality, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 114, Y = 455.0, Text = app.CallSign, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 298, Y = 455.0, Text = app.AtrocArslNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 505, Y = 455.0, Text = app.Validity != default ? app.Validity.ToString("MM/dd/yy") : "", FontSize = 8 });

        items.Add(new TextOverlayItem { X = 160, Y = 470.0, Text = p.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 390, Y = 470.0, Text = p.Address.Street, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 160, Y = 485.0, Text = p.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 390, Y = 485.0, Text = p.Address.CityMunicipality, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 160, Y = 500.0, Text = p.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 390, Y = 500.0, Text = p.Address.ZipCode, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 160, Y = 515.0, Text = p.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 390, Y = 515.0, Text = p.Email, FontSize = 8 });

        // 5. EXAMINATION DETAILS
        var ex = app.ExamSeminarDetails;
        items.Add(new TextOverlayItem { X = 160, Y = 544.0, Text = ex.PlaceOfExamSeminar, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 413, Y = 544.0, Text = ex.Date != default ? ex.Date.ToString("MM/dd/yy") : "", FontSize = 8 });
        items.Add(new TextOverlayItem { X = 529, Y = 544.0, Text = ex.Rating, FontSize = 8 });

        // 6. PARTICULARS OF EQUIPMENT (Up to 4 rows)
        double[] rowY = { 589.0, 604.0, 619.0, 634.0 };
        for (int i = 0; i < app.Equipment.Count && i < 4; i++)
        {
            var eq = app.Equipment[i];
            double y = rowY[i];

            items.Add(new TextOverlayItem { X = 45, Y = y, Text = eq.Make, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 160, Y = y, Text = eq.TypeModel, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 275, Y = y, Text = eq.SerialNumber, FontSize = 8 });
            items.Add(new TextOverlayItem { X = 459, Y = y, Text = eq.FrequencyRange, FontSize = 8 });
        }

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(63.6, 364.0, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 740.0, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(145.6, 292.5, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 774.0, Text = dateAccomplishedText, FontSize = 8 });
        }

        // 8. OFFICIAL RECEIPT BOX (x: 386.4 - 551.9, y: 698.2 - 778.0)
        if (app.Payment != null)
        {
            items.Add(new TextOverlayItem { X = 455, Y = 717.0, Text = app.Payment.OrNo, FontSize = 8 });
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextOverlayItem { X = 459, Y = 728.0, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 528, Y = 728.0, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }
            items.Add(new TextOverlayItem { X = 445, Y = 739.0, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                double officerX = CenterX(420.0, 530.0, app.Payment.CollectingOfficer, 8, false);
                items.Add(new TextOverlayItem { X = officerX, Y = 759.0, Text = app.Payment.CollectingOfficer, FontSize = 8 });
            }
        }

        return items;
    }
}
