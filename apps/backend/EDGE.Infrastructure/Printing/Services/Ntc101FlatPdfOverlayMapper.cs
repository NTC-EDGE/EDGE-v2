using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps Ntc101Application onto coordinate positions (X, Y in points) for the flat NTC 1-01
/// PDF template using PdfSharp XGraphics overlay.
///
/// All coordinates below were measured from the template's own geometry (label word positions
/// + vector table/checkbox rects extracted via PyMuPDF), not guessed or reused from another
/// form's mapper — see Flat_PDF_Overlay_Mapping_Principles.md for the methodology. Page size:
/// 595.3 x 841.9 pt (A4). Y is top-down, matching PdfSharp XGraphics' default convention.
/// </summary>
public static class Ntc101FlatPdfOverlayMapper
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

    public static List<TextOverlayItem> MapToOverlayItems(Ntc101Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. Exam category/code checkboxes.
        // Two checkbox columns, both 24.6pt wide: RTG/PHN column at x 44.76-69.36 (center
        // 57.06), AMATEUR/RESTRICTED column at x 338.52-363.12 (center 350.82). Row Y values
        // are each option's own label vertical center — confirmed against the template's
        // checkbox border rects, which matched these centers within 0.1pt for every row checked.
        const double rtgPhnColX = 57.06;
        const double amateurRestrictedColX = 350.82;

        (double x, double y) checkboxPos = app.ExamCode switch
        {
            ExamCode.Rtg1_Elements1_2_5_6_Code2520Wpm => (rtgPhnColX, 186.5),
            ExamCode.Rtg1_Code2520Wpm => (rtgPhnColX, 197.7),
            ExamCode.Rtg2_Elements1_2_5_6_Code16Wpm => (rtgPhnColX, 209.0),
            ExamCode.Rtg2_Code16Wpm => (rtgPhnColX, 220.3),
            ExamCode.Rtg3_Elements1_2_5_Code16Wpm => (rtgPhnColX, 231.6),
            ExamCode.Rtg3_Code16Wpm => (rtgPhnColX, 242.85),
            ExamCode.Phn1_Elements1_2_3_4 => (rtgPhnColX, 271.05),
            ExamCode.Phn2_Elements1_2_3 => (rtgPhnColX, 282.3),
            ExamCode.Phn3_Elements1_2 => (rtgPhnColX, 293.6),
            ExamCode.ClassA_Elements8_9_10_Code5Wpm => (amateurRestrictedColX, 186.5),
            ExamCode.ClassA_Code5WpmOnly => (amateurRestrictedColX, 197.7),
            ExamCode.ClassB_Elements5_6_7 => (amateurRestrictedColX, 209.0),
            ExamCode.ClassB_Element2 => (amateurRestrictedColX, 220.3),
            ExamCode.ClassC_Elements2_3_4 => (amateurRestrictedColX, 231.6),
            ExamCode.ClassD_Element2 => (amateurRestrictedColX, 242.85),
            ExamCode.RrocAircraft_Element1 => (amateurRestrictedColX, 271.05),
            _ => (rtgPhnColX, 186.5)
        };
        // Checkbox cells are 24.6pt wide; center the "X" glyph using CenterX so it lands
        // at true visual center, not just the midpoint where the glyph's left edge would start.
        const double checkboxHalfWidth = 12.3; // 24.6pt / 2
        double examCheckX = CenterX(checkboxPos.x - checkboxHalfWidth, checkboxPos.x + checkboxHalfWidth, "X", 9, true);
        items.Add(new TextOverlayItem { X = examCheckX, Y = checkboxPos.y, Text = "X", FontSize = 9, IsBold = true });

        // Date of Exam (top-right of the checkbox grid): value cell x 436.44-546.24, y 288-299.4.
        items.Add(new TextOverlayItem { X = 440, Y = 298.4, Text = app.DateOfExam.ToString("MM/dd/yy"), FontSize = 8 });

        // 2. Applicant's Details.
        // Row grid is 11.88pt tall, running y 314.88-421.8 (Last Name through Course Taken).
        // Baseline = row_bottom - 0.9 (calibrated against every row's own label y1, which sits
        // consistently ~0.86-0.9pt above its row's bottom border).
        var p = app.ApplicantPerson;
        items.Add(new TextOverlayItem { X = 97, Y = 325.9, Text = p.LastName, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 464, Y = 325.9, Text = p.DateOfBirth.ToString("MM/dd/yy"), FontSize = 8 });

        items.Add(new TextOverlayItem { X = 97, Y = 337.7, Text = p.FirstName, FontSize = 8, IsBold = true });
        // Sex: two checkbox cells (Male 411.96-461.04, Female 506.04-546.24), both y-center 333.24.
        var sexBox = p.Sex == Sex.Male ? (left: 411.96, right: 461.04) : (left: 506.04, right: 546.24);
        double sexCheckX = CenterX(sexBox.left, sexBox.right, "X", 9, true);
        items.Add(new TextOverlayItem { X = sexCheckX, Y = 333.24, Text = "X", FontSize = 9, IsBold = true });

        items.Add(new TextOverlayItem { X = 97, Y = 349.6, Text = p.MiddleName, FontSize = 8, IsBold = true });
        items.Add(new TextOverlayItem { X = 415, Y = 349.6, Text = p.Nationality, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 146, Y = 361.5, Text = p.Address.UnitRoomBldgNo, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 415, Y = 361.5, Text = p.Address.Street, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 146, Y = 373.4, Text = p.Address.Barangay, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 415, Y = 373.4, Text = p.Address.CityMunicipality, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 146, Y = 385.3, Text = p.Address.Province, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 415, Y = 385.3, Text = p.Address.ZipCode, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 146, Y = 397.1, Text = p.ContactNumber, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 415, Y = 397.1, Text = p.Email, FontSize = 8 });

        // School Attended is a single full-width field (no right-column pair), value cell
        // x 118.2-580.68.
        items.Add(new TextOverlayItem { X = 122, Y = 409.0, Text = p.SchoolAttended, FontSize = 8 });

        items.Add(new TextOverlayItem { X = 122, Y = 420.9, Text = p.CourseTaken, FontSize = 8 });
        if (p.YearGraduated.HasValue)
        {
            items.Add(new TextOverlayItem { X = 415, Y = 420.9, Text = p.YearGraduated.Value.ToString(), FontSize = 8 });
        }

        // 3. Applicant's Request for Assistance.
        // Yes box x 314.04-338.64, No box x 363.0-387.6, both y-center 440.16.
        var assistanceBox = app.AssistanceRequest.NeedsAssistance ? (left: 314.04, right: 338.64) : (left: 363.0, right: 387.6);
        double assistanceCheckX = CenterX(assistanceBox.left, assistanceBox.right, "X", 9, true);
        items.Add(new TextOverlayItem { X = assistanceCheckX, Y = 440.16, Text = "X", FontSize = 9, IsBold = true });

        if (app.AssistanceRequest.NeedsAssistance && !string.IsNullOrWhiteSpace(app.AssistanceRequest.Details))
        {
            // "If yes, please indicate..." blank: value cell x 240.6-580.68, y 446.04-458.04.
            items.Add(new TextOverlayItem { X = 244, Y = 457.0, Text = app.AssistanceRequest.Details, FontSize = 8 });
        }

        // 4. Declaration — signature and OR box.
        // Both boxes share center x ~179.5: signature box x 44.76-314.16, y 523.32-536.16;
        // date-accomplished box x 118.2-240.72, y 547.08-559.08.
        const double signatureBoxLeft = 44.76, signatureBoxRight = 314.16;
        const double dateBoxLeft = 118.2, dateBoxRight = 240.72;

        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(signatureBoxLeft, signatureBoxRight, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 534, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }
        if (app.Declaration.DateAccomplished != default)
        {
            string dateAccomplishedText = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(dateBoxLeft, dateBoxRight, dateAccomplishedText, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 557, Text = dateAccomplishedText, FontSize = 8 });
        }

        // OR box is a flattened image at x 392.4-569.16, y 497.88-582.48 (different position than
        // NTC 1-19's OR box, but same internal layout). MM/DD and 2-digit year are split into
        // their own blanks, matching the fix already validated on NTC 1-19.
        if (app.Payment != null)
        {
            items.Add(new TextOverlayItem { X = 478, Y = 519, Text = app.Payment.OrNo, FontSize = 8 });
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextOverlayItem { X = 478, Y = 532, Text = app.Payment.OrDate.ToString("MM/dd"), FontSize = 8 });
                items.Add(new TextOverlayItem { X = 539, Y = 532, Text = app.Payment.OrDate.ToString("yy"), FontSize = 8 });
            }
            items.Add(new TextOverlayItem { X = 449, Y = 544, Text = $"PHP {app.Payment.Amount:N2}", FontSize = 8 });
            items.Add(new TextOverlayItem { X = 464, Y = 564, Text = app.Payment.CollectingOfficer, FontSize = 8 });
        }

        // 5. Examination Admission Slip.
        // "Admit / mailing address" block: value cell x 167.16-461.04, 4 rows of 11.88pt
        // (y 623.04-671.16). Baseline = row_bottom - 1.0.
        var slip = app.AdmissionSlip;
        items.Add(new TextOverlayItem { X = 171, Y = 633.9, Text = slip.ExamineeName, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 171, Y = 645.8, Text = slip.MailingAddressLine1, FontSize = 8 });
        if (!string.IsNullOrWhiteSpace(slip.MailingAddressLine2))
        {
            items.Add(new TextOverlayItem { X = 171, Y = 657.7, Text = slip.MailingAddressLine2, FontSize = 8 });
        }
        items.Add(new TextOverlayItem { X = 171, Y = 669.6, Text = slip.ExaminationFor, FontSize = 8 });

        // "Place/Date/Time of Exam" block: narrower value cell x 167.16-338.64 (the ID picture
        // box occupies the space to the right), 3 rows of 11.88pt (y 674.76-710.4).
        items.Add(new TextOverlayItem { X = 171, Y = 685.6, Text = slip.PlaceOfExam, FontSize = 8 });
        items.Add(new TextOverlayItem { X = 171, Y = 697.5, Text = slip.DateOfExam.ToString("MM/dd/yy"), FontSize = 8 });
        items.Add(new TextOverlayItem { X = 171, Y = 709.4, Text = slip.TimeOfExam, FontSize = 8 });

        // Authorized Officer signature: box x 387.48-546.24, y 713.52-724.92 — normally left
        // blank at submission time (filled in by NTC staff), so only rendered if present.
        if (!string.IsNullOrWhiteSpace(slip.AuthorizedOfficer))
        {
            double officerX = CenterX(387.48, 546.24, slip.AuthorizedOfficer, 8, false);
            items.Add(new TextOverlayItem { X = officerX, Y = 723.9, Text = slip.AuthorizedOfficer, FontSize = 8 });
        }

        return items;
    }
}
