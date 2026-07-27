using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-02 (Application for Radio Operator License).
/// </summary>
public static class Ntc102FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc102Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. TYPE OF APPLICATION
        var actionField = app.TypeOfApplication switch
        {
            TypeOfApplication.New => Ntc102Fields.TypeOfApplication.New,
            TypeOfApplication.Renewal => Ntc102Fields.TypeOfApplication.Renewal,
            TypeOfApplication.Modification => Ntc102Fields.TypeOfApplication.Modification,
            _ => Ntc102Fields.TypeOfApplication.New
        };
        items.Add(new CheckboxFieldOverlay(actionField, true));

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.TypeOfApplication.ModificationReason, app.ModificationReason));
        }

        if (app.NoOfYears.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.TypeOfApplication.NoOfYears, app.NoOfYears.Value.ToString()));
        }

        // 2. TYPE OF CERTIFICATE
        var certField = app.TypeOfCertificate switch
        {
            TypeOfCertificate.Rtg1 => Ntc102Fields.TypeOfCertificate.Rtg1,
            TypeOfCertificate.Rtg2 => Ntc102Fields.TypeOfCertificate.Rtg2,
            TypeOfCertificate.Rtg3 => Ntc102Fields.TypeOfCertificate.Rtg3,
            TypeOfCertificate.Phn1 => Ntc102Fields.TypeOfCertificate.Phn1,
            TypeOfCertificate.Phn2 => Ntc102Fields.TypeOfCertificate.Phn2,
            TypeOfCertificate.Phn3 => Ntc102Fields.TypeOfCertificate.Phn3,
            TypeOfCertificate.Srop => Ntc102Fields.TypeOfCertificate.Srop,
            TypeOfCertificate.Rlm => Ntc102Fields.TypeOfCertificate.Rlm,
            TypeOfCertificate.RrocAircraft => Ntc102Fields.TypeOfCertificate.RrocAircraft,
            TypeOfCertificate.Groc => Ntc102Fields.TypeOfCertificate.Groc,
            TypeOfCertificate.TpRrocAircraft => Ntc102Fields.TypeOfCertificate.TpRrocAircraft,
            TypeOfCertificate.Others => Ntc102Fields.TypeOfCertificate.Others,
            _ => Ntc102Fields.TypeOfCertificate.Rtg1
        };
        items.Add(new CheckboxFieldOverlay(certField, true));

        if (app.TypeOfCertificate == TypeOfCertificate.Others && !string.IsNullOrWhiteSpace(app.OtherCertificateDetails))
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.TypeOfCertificate.OtherCertificateDetails, app.OtherCertificateDetails));
        }

        // 3. APPLICANT'S DETAILS
        var p = app.ApplicantPerson;
        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.LastName, p.LastName));
        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.DateOfBirth, p.DateOfBirth.ToString("MM/dd/yy")));

        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.FirstName, p.FirstName));
        if (p.HeightCm.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.HeightCm, p.HeightCm.Value.ToString("F0")));
        }
        if (p.WeightKg.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.WeightKg, p.WeightKg.Value.ToString("F0")));
        }

        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.MiddleName, p.MiddleName));

        var sexField = p.Sex == Sex.Male ? Ntc102Fields.Applicant.SexMale : Ntc102Fields.Applicant.SexFemale;
        items.Add(new CheckboxFieldOverlay(sexField, true));

        // Employment Status
        if (p.EmploymentStatus == EmploymentStatus.Unemployed)
        {
            items.Add(new CheckboxFieldOverlay(Ntc102Fields.Applicant.Unemployed, true));
        }
        else
        {
            items.Add(new CheckboxFieldOverlay(Ntc102Fields.Applicant.Employed, true));
            if (p.EmploymentStatus == EmploymentStatus.EmployedLocal)
            {
                items.Add(new CheckboxFieldOverlay(Ntc102Fields.Applicant.EmployedLocal, true));
            }
            else if (p.EmploymentStatus == EmploymentStatus.EmployedForeign)
            {
                items.Add(new CheckboxFieldOverlay(Ntc102Fields.Applicant.EmployedForeign, true));
            }
        }

        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.Nationality, p.Nationality));

        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.UnitRoomBldgNo, p.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.Street, p.Address.Street));

        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.Barangay, p.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.CityMunicipality, p.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.Province, p.Address.Province));
        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.ZipCode, p.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.ContactNumber, p.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc102Fields.Applicant.Email, p.Email));

        // 4. EXAM / SEMINAR DETAILS
        var ex = app.ExamSeminarDetails;
        items.Add(new TextFieldOverlay(Ntc102Fields.ExamSeminarDetails.PlaceOfExamSeminar, ex.PlaceOfExamSeminar));
        if (ex.Date != default)
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.ExamSeminarDetails.Date, ex.Date.ToString("MM/dd/yy")));
        }
        items.Add(new TextFieldOverlay(Ntc102Fields.ExamSeminarDetails.Rating, ex.Rating));

        // 5. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 6. OFFICIAL RECEIPT BOX
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc102Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc102Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc102Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc102Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc102Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc102Application app)
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
