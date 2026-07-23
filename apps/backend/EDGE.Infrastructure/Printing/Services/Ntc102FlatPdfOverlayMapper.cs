using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc102Application (NTC 1-02) onto coordinate positions (X, Y in points)
/// for non-fillable or flat PDF templates using PdfSharp XGraphics overlay.
///
/// Page size: 595.2 x 841.8 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// Coordinates measured directly from ntc-1-02.pdf template vector geometry.
/// </summary>
public static class Ntc102FlatPdfOverlayMapper
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

    public static List<TextOverlayItem> MapToOverlayItems(Ntc102Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. TYPE OF APPLICATION
        // Checkbox column x: 59.42 - 84.43
        (double top, double bottom) actionBox = app.TypeOfApplication switch
        {
            TypeOfApplication.New => (275.67, 290.87),
            TypeOfApplication.Renewal => (290.67, 305.87),
            TypeOfApplication.Modification => (305.67, 320.87),
            _ => (275.67, 290.87)
        };
        double actionCheckX = CenterX(59.42, 84.43, "✔", 9, true);
        double actionCheckY = (actionBox.top + actionBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = actionCheckX, Y = actionCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextOverlayItem { X = 88, Y = 332.0, Text = app.ModificationReason, FontSize = 8 });
        }

        if (app.NoOfYears.HasValue)
        {
            string yearsTxt = app.NoOfYears.Value.ToString();
            double yearsX = CenterX(109.02, 134.04, yearsTxt, 8, true);
            items.Add(new TextOverlayItem { X = yearsX, Y = 358.28, Text = yearsTxt, FontSize = 8, IsBold = true });
        }

        // 2. TYPE OF CERTIFICATE
        // Column 1 (RTG/PHN): x 282.70 - 307.70; Column 2 (Amateur/RROC/Govt): x 381.93 - 406.95
        (double left, double right, double top, double bottom) certBox = app.TypeOfCertificate switch
        {
            TypeOfCertificate.Rtg1 => (282.70, 307.70, 275.67, 290.87),
            TypeOfCertificate.Rtg2 => (282.70, 307.70, 290.67, 305.87),
            TypeOfCertificate.Rtg3 => (282.70, 307.70, 305.67, 320.87),
            TypeOfCertificate.Phn1 => (282.70, 307.70, 320.67, 335.87),
            TypeOfCertificate.Phn2 => (282.70, 307.70, 335.68, 350.88),
            TypeOfCertificate.Phn3 => (282.70, 307.70, 350.68, 365.88),
            TypeOfCertificate.Srop => (381.93, 406.95, 275.67, 290.87),
            TypeOfCertificate.Rlm => (381.93, 406.95, 290.67, 305.87),
            TypeOfCertificate.RrocAircraft => (381.93, 406.95, 305.67, 320.87),
            TypeOfCertificate.Groc => (381.93, 406.95, 320.67, 335.87),
            TypeOfCertificate.TpRrocAircraft => (381.93, 406.95, 335.68, 350.88),
            TypeOfCertificate.Others => (381.93, 406.95, 350.68, 365.88),
            _ => (282.70, 307.70, 275.67, 290.87)
        };
        double certCheckX = CenterX(certBox.left, certBox.right, "✔", 9, true);
        double certCheckY = (certBox.top + certBox.bottom) / 2.0;
        items.Add(new TextOverlayItem { X = certCheckX, Y = certCheckY, Text = "✔", FontSize = 9, IsBold = true });

        if (app.TypeOfCertificate == TypeOfCertificate.Others && !string.IsNullOrWhiteSpace(app.OtherCertificateDetails))
        {
            items.Add(new TextOverlayItem { X = 410, Y = 377.0, Text = app.OtherCertificateDetails, FontSize = 8 });
        }

        // 3. APPLICANT'S DETAILS
        var p = app.ApplicantPerson;
        items.Add(new TextOverlayItem { X = 88, Y = 422.0, Text = p.LastName, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 460, Y = 422.0, Text = p.DateOfBirth.ToString("MM/dd/yy"), FontSize = 8 });

        items.Add(new TextOverlayItem { X = 88, Y = 437.0, Text = p.FirstName, FontSize = 8, IsBold = true });
        if (p.HeightCm.HasValue)
        {
            items.Add(new TextOverlayItem { X = 410, Y = 437.0, Text = p.HeightCm.Value.ToString("F0"), FontSize = 8 });
        }
        if (p.WeightKg.HasValue)
        {
            items.Add(new TextOverlayItem { X = 534, Y = 437.0, Text = p.WeightKg.Value.ToString("F0"), FontSize = 8 });
        }

        items.Add(new TextOverlayItem { X = 88, Y = 452.0, Text = p.MiddleName, FontSize = 8, IsBold = true });

        // Sex checkbox (Male 84.22-134.05, Female 183.45-233.27)
        var sexBox = p.Sex == Sex.Male ? (left: 84.22, right: 134.05) : (left: 183.45, right: 233.27);
        double sexCheckX = CenterX(sexBox.left, sexBox.right, "✔", 9, true);
        items.Add(new TextOverlayItem { X = sexCheckX, Y = 463.31, Text = "✔", FontSize = 9, IsBold = true });

        // Status of Employment
        if (p.EmploymentStatus == EmploymentStatus.Unemployed)
        {
            double unCheckX = CenterX(381.93, 406.95, "✔", 9, true);
            items.Add(new TextOverlayItem { X = unCheckX, Y = 448.30, Text = "✔", FontSize = 9, IsBold = true });
        }
        else
        {
            double empCheckX = CenterX(481.18, 506.18, "✔", 9, true);
            items.Add(new TextOverlayItem { X = empCheckX, Y = 448.30, Text = "✔", FontSize = 9, IsBold = true });

            if (p.EmploymentStatus == EmploymentStatus.EmployedLocal)
            {
                double locCheckX = CenterX(406.75, 431.75, "✔", 9, true);
                items.Add(new TextOverlayItem { X = locCheckX, Y = 463.31, Text = "✔", FontSize = 9, IsBold = true });
            }
            else if (p.EmploymentStatus == EmploymentStatus.EmployedForeign)
            {
                double forCheckX = CenterX(406.75, 431.75, "✔", 9, true);
                items.Add(new TextOverlayItem { X = forCheckX, Y = 478.33, Text = "✔", FontSize = 9, IsBold = true });
            }
        }

        items.Add(new TextOverlayItem { X = 88, Y = 482.0, Text = p.Nationality, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 138, Y = 497.0, Text = p.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 386, Y = 497.0, Text = p.Address.Street, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 138, Y = 512.0, Text = p.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 386, Y = 512.0, Text = p.Address.CityMunicipality, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 138, Y = 527.0, Text = p.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 386, Y = 527.0, Text = p.Address.ZipCode, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 138, Y = 542.0, Text = p.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 386, Y = 542.0, Text = p.Email, FontSize = 8 });

        // 4. EXAM / SEMINAR DETAILS
        var ex = app.ExamSeminarDetails;
        items.Add(new TextOverlayItem { X = 138, Y = 572.0, Text = ex.PlaceOfExamSeminar, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 386, Y = 572.0, Text = ex.Date != default ? ex.Date.ToString("MM/dd/yy") : "", FontSize = 8 });
        items.Add(new TextOverlayItem { X = 535, Y = 572.0, Text = ex.Rating, FontSize = 8 });

        // 5. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(34.60, 357.33, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 693.0, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(134.90, 257.40, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 722.0, Text = dateAccomplishedText, FontSize = 8 });
        }

        // 6. OFFICIAL RECEIPT BOX (y: 648.5 - 729.1, x: 386.8 - 550.3)
        if (app.Payment != null)
        {
            items.Add(new TextOverlayItem { X = 450, Y = 666, Text = app.Payment.OrNo, FontSize = 8 });
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextOverlayItem { X = 458, Y = 676, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 502, Y = 676, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }
            items.Add(new TextOverlayItem { X = 438, Y = 688, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });
            items.Add(new TextOverlayItem { X = 434, Y = 708, Text = app.Payment.CollectingOfficer, FontSize = 8 });
        }

        return items;
    }
}
