using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-03 (Application for Amateur Radio Station License).
/// </summary>
public static class Ntc103FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc103Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. TYPE OF APPLICATION
        var actionField = app.TypeOfApplication switch
        {
            TypeOfApplication.New => Ntc103Fields.TypeOfApplication.New,
            TypeOfApplication.Renewal => Ntc103Fields.TypeOfApplication.Renewal,
            TypeOfApplication.Modification => Ntc103Fields.TypeOfApplication.Modification,
            _ => Ntc103Fields.TypeOfApplication.New
        };
        items.Add(new CheckboxFieldOverlay(actionField, true));

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.TypeOfApplication.ModificationReason, app.ModificationReason));
        }

        if (app.NoOfYears.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.TypeOfApplication.NoOfYears, app.NoOfYears.Value.ToString()));
        }

        // 2. TYPE OF PERMIT / LICENSE / CERTIFICATE
        var permitCertField = app.TypeOfPermitLicenseCert switch
        {
            TypeOfPermitLicenseCert103.AmateurRadioOperatorCertificate => Ntc103Fields.TypeOfPermitLicenseCert.AmateurRadioOperatorCertificate,
            TypeOfPermitLicenseCert103.AmateurRadioStationLicense => Ntc103Fields.TypeOfPermitLicenseCert.AmateurRadioStationLicense,
            TypeOfPermitLicenseCert103.ClubRadioStationLicense => Ntc103Fields.TypeOfPermitLicenseCert.ClubRadioStationLicense,
            TypeOfPermitLicenseCert103.TemporaryPermitForeignVisitor => Ntc103Fields.TypeOfPermitLicenseCert.TemporaryPermitForeignVisitor,
            TypeOfPermitLicenseCert103.SpecialPermitVanityCallSign => Ntc103Fields.TypeOfPermitLicenseCert.SpecialPermitVanityCallSign,
            _ => Ntc103Fields.TypeOfPermitLicenseCert.AmateurRadioOperatorCertificate
        };
        items.Add(new CheckboxFieldOverlay(permitCertField, true));

        if (!string.IsNullOrWhiteSpace(app.NameOfClub))
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.TypeOfPermitLicenseCert.NameOfClub, app.NameOfClub));
        }
        if (!string.IsNullOrWhiteSpace(app.AssignedFreq))
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.TypeOfPermitLicenseCert.AssignedFreq, app.AssignedFreq));
        }
        if (!string.IsNullOrWhiteSpace(app.PreferredCallSigns))
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.TypeOfPermitLicenseCert.PreferredCallSigns, app.PreferredCallSigns));
        }

        // 3. CLASS OF STATION
        var classField = app.ClassOfStation switch
        {
            ClassOfStationAmateur.ClassA => Ntc103Fields.ClassOfStation.ClassA,
            ClassOfStationAmateur.ClassB => Ntc103Fields.ClassOfStation.ClassB,
            ClassOfStationAmateur.ClassC => Ntc103Fields.ClassOfStation.ClassC,
            ClassOfStationAmateur.ClassD => Ntc103Fields.ClassOfStation.ClassD,
            _ => Ntc103Fields.ClassOfStation.ClassA
        };
        items.Add(new CheckboxFieldOverlay(classField, true));

        // 4. APPLICANT'S DETAILS
        var p = app.ApplicantPerson;
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.LastName, p.LastName));
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.DateOfBirth, p.DateOfBirth.ToString("MM/dd/yy")));

        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.FirstName, p.FirstName));
        var sexField = p.Sex == Sex.Male ? Ntc103Fields.Applicant.SexMale : Ntc103Fields.Applicant.SexFemale;
        items.Add(new CheckboxFieldOverlay(sexField, true));

        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.MiddleName, p.MiddleName));
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.Nationality, p.Nationality));

        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.CallSign, app.CallSign));
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.AtrocArslNo, app.AtrocArslNo));
        if (app.Validity != default)
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.Validity, app.Validity.ToString("MM/dd/yy")));
        }

        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.UnitRoomBldgNo, p.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.Street, p.Address.Street));

        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.Barangay, p.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.CityMunicipality, p.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.Province, p.Address.Province));
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.ZipCode, p.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.ContactNumber, p.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc103Fields.Applicant.Email, p.Email));

        // 5. EXAMINATION DETAILS
        var ex = app.ExamSeminarDetails;
        items.Add(new TextFieldOverlay(Ntc103Fields.ExamSeminarDetails.PlaceOfExamSeminar, ex.PlaceOfExamSeminar));
        if (ex.Date != default)
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.ExamSeminarDetails.Date, ex.Date.ToString("MM/dd/yy")));
        }
        items.Add(new TextFieldOverlay(Ntc103Fields.ExamSeminarDetails.Rating, ex.Rating));

        // 6. PARTICULARS OF EQUIPMENT
        for (int i = 0; i < app.Equipment.Count && i < 4; i++)
        {
            var eq = app.Equipment[i];
            var (makeField, typeField, serialField, freqField) = i switch
            {
                0 => (Ntc103Fields.Equipment.MakeRow1, Ntc103Fields.Equipment.TypeModelRow1, Ntc103Fields.Equipment.SerialNumberRow1, Ntc103Fields.Equipment.FrequencyRangeRow1),
                1 => (Ntc103Fields.Equipment.MakeRow2, Ntc103Fields.Equipment.TypeModelRow2, Ntc103Fields.Equipment.SerialNumberRow2, Ntc103Fields.Equipment.FrequencyRangeRow2),
                2 => (Ntc103Fields.Equipment.MakeRow3, Ntc103Fields.Equipment.TypeModelRow3, Ntc103Fields.Equipment.SerialNumberRow3, Ntc103Fields.Equipment.FrequencyRangeRow3),
                _ => (Ntc103Fields.Equipment.MakeRow4, Ntc103Fields.Equipment.TypeModelRow4, Ntc103Fields.Equipment.SerialNumberRow4, Ntc103Fields.Equipment.FrequencyRangeRow4)
            };

            items.Add(new TextFieldOverlay(makeField, eq.Make));
            items.Add(new TextFieldOverlay(typeField, eq.TypeModel));
            items.Add(new TextFieldOverlay(serialField, eq.SerialNumber));
            items.Add(new TextFieldOverlay(freqField, eq.FrequencyRange));
        }

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 8. OFFICIAL RECEIPT BOX
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc103Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc103Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc103Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc103Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc103Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc103Application app)
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
