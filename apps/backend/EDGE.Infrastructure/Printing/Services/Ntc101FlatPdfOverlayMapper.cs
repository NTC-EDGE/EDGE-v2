using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-01 (Commercial Radio Operator Exam Application).
/// </summary>
public static class Ntc101FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc101Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. Exam Category Checkbox
        var examField = app.ExamCode switch
        {
            ExamCode.Rtg1_Elements1_2_5_6_Code2520Wpm => Ntc101Fields.ExamCategory.Rtg1_Elements1_2_5_6_Code2520Wpm,
            ExamCode.Rtg1_Code2520Wpm => Ntc101Fields.ExamCategory.Rtg1_Code2520Wpm,
            ExamCode.Rtg2_Elements1_2_5_6_Code16Wpm => Ntc101Fields.ExamCategory.Rtg2_Elements1_2_5_6_Code16Wpm,
            ExamCode.Rtg2_Code16Wpm => Ntc101Fields.ExamCategory.Rtg2_Code16Wpm,
            ExamCode.Rtg3_Elements1_2_5_Code16Wpm => Ntc101Fields.ExamCategory.Rtg3_Elements1_2_5_Code16Wpm,
            ExamCode.Rtg3_Code16Wpm => Ntc101Fields.ExamCategory.Rtg3_Code16Wpm,
            ExamCode.Phn1_Elements1_2_3_4 => Ntc101Fields.ExamCategory.Phn1_Elements1_2_3_4,
            ExamCode.Phn2_Elements1_2_3 => Ntc101Fields.ExamCategory.Phn2_Elements1_2_3,
            ExamCode.Phn3_Elements1_2 => Ntc101Fields.ExamCategory.Phn3_Elements1_2,
            ExamCode.ClassA_Elements8_9_10_Code5Wpm => Ntc101Fields.ExamCategory.ClassA_Elements8_9_10_Code5Wpm,
            ExamCode.ClassA_Code5WpmOnly => Ntc101Fields.ExamCategory.ClassA_Code5WpmOnly,
            ExamCode.ClassB_Elements5_6_7 => Ntc101Fields.ExamCategory.ClassB_Elements5_6_7,
            ExamCode.ClassB_Element2 => Ntc101Fields.ExamCategory.ClassB_Element2,
            ExamCode.ClassC_Elements2_3_4 => Ntc101Fields.ExamCategory.ClassC_Elements2_3_4,
            ExamCode.ClassD_Element2 => Ntc101Fields.ExamCategory.ClassD_Element2,
            ExamCode.RrocAircraft_Element1 => Ntc101Fields.ExamCategory.RrocAircraft_Element1,
            _ => Ntc101Fields.ExamCategory.Rtg1_Elements1_2_5_6_Code2520Wpm
        };
        items.Add(new CheckboxFieldOverlay(examField, true));

        // Date of Exam
        items.Add(new TextFieldOverlay(Ntc101Fields.ExamCategory.DateOfExam, app.DateOfExam.ToString("MM/dd/yy")));

        // 2. Applicant Details
        var p = app.ApplicantPerson;
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.LastName, p.LastName));
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.DateOfBirth, p.DateOfBirth.ToString("MM/dd/yy")));

        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.FirstName, p.FirstName));
        var sexField = p.Sex == Sex.Male ? Ntc101Fields.Applicant.SexMale : Ntc101Fields.Applicant.SexFemale;
        items.Add(new CheckboxFieldOverlay(sexField, true));

        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.MiddleName, p.MiddleName));
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.Nationality, p.Nationality));

        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.UnitRoomBldgNo, p.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.Street, p.Address.Street));

        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.Barangay, p.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.CityMunicipality, p.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.Province, p.Address.Province));
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.ZipCode, p.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.ContactNumber, p.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.Email, p.Email));

        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.SchoolAttended, p.SchoolAttended));
        items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.CourseTaken, p.CourseTaken));

        if (p.YearGraduated.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc101Fields.Applicant.YearGraduated, p.YearGraduated.Value.ToString()));
        }

        // 3. Assistance Request
        var assistField = app.AssistanceRequest.NeedsAssistance ? Ntc101Fields.Assistance.NeedsAssistanceYes : Ntc101Fields.Assistance.NeedsAssistanceNo;
        items.Add(new CheckboxFieldOverlay(assistField, true));

        if (app.AssistanceRequest.NeedsAssistance && !string.IsNullOrWhiteSpace(app.AssistanceRequest.Details))
        {
            items.Add(new TextFieldOverlay(Ntc101Fields.Assistance.Details, app.AssistanceRequest.Details));
        }

        // 4. Declaration
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc101Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc101Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 5. Payment Box
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc101Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc101Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc101Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc101Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            items.Add(new TextFieldOverlay(Ntc101Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
        }

        // 6. Examination Admission Slip
        var slip = app.AdmissionSlip;
        items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.ExamineeName, slip.ExamineeName));
        items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.MailingAddressLine1, slip.MailingAddressLine1));
        if (!string.IsNullOrWhiteSpace(slip.MailingAddressLine2))
        {
            items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.MailingAddressLine2, slip.MailingAddressLine2));
        }
        items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.ExaminationFor, slip.ExaminationFor));

        items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.PlaceOfExam, slip.PlaceOfExam));
        items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.DateOfExam, slip.DateOfExam.ToString("MM/dd/yy")));
        items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.TimeOfExam, slip.TimeOfExam));

        if (!string.IsNullOrWhiteSpace(slip.AuthorizedOfficer))
        {
            items.Add(new TextFieldOverlay(Ntc101Fields.AdmissionSlip.AuthorizedOfficer, slip.AuthorizedOfficer));
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc101Application app)
    {
        var items = new List<TextOverlayItem>();
        foreach (var fieldOverlay in MapToFieldOverlays(app))
        {
            if (fieldOverlay is TextFieldOverlay text)
            {
                items.Add(new TextOverlayItem
                {
                    X = text.Field.X,
                    Y = text.Field.Y,
                    Text = text.Text,
                    FontSize = text.Field.FontSize,
                    IsBold = text.Field.IsBold
                });
            }
            else if (fieldOverlay is CheckboxFieldOverlay check && check.IsChecked)
            {
                items.Add(new TextOverlayItem
                {
                    X = check.Field.X,
                    Y = check.Field.Y,
                    Text = "✔",
                    FontSize = check.Field.FontSize,
                    IsBold = check.Field.IsBold
                });
            }
        }
        return items;
    }
}
