using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-14 (Application for Temporary Permit to Propagate/Demonstrate).
/// </summary>
public static class Ntc114FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc114Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. NATURE OF SERVICE CHECKBOXES
        var natureField = app.NatureOfService switch
        {
            NatureOfService114.CV => Ntc114Fields.NatureOfService.CV,
            NatureOfService114.CO => Ntc114Fields.NatureOfService.CO,
            NatureOfService114.CP => Ntc114Fields.NatureOfService.CP,
            NatureOfService114.Others => Ntc114Fields.NatureOfService.Others,
            _ => Ntc114Fields.NatureOfService.CV
        };
        items.Add(new CheckboxFieldOverlay(natureField, true));

        if (app.NatureOfService == NatureOfService114.Others && !string.IsNullOrWhiteSpace(app.NatureOfServiceOther))
        {
            items.Add(new TextFieldOverlay(Ntc114Fields.NatureOfService.OtherDetails, app.NatureOfServiceOther));
        }

        // 2. TYPE OF RADIO SERVICE CHECKBOXES
        var radioServiceField = app.TypeOfRadioService switch
        {
            TypeOfRadioService114.FixedAndLandMobile => Ntc114Fields.TypeOfRadioService.FixedAndLandMobile,
            TypeOfRadioService114.Aeronautical => Ntc114Fields.TypeOfRadioService.Aeronautical,
            TypeOfRadioService114.Broadcast => Ntc114Fields.TypeOfRadioService.Broadcast,
            TypeOfRadioService114.Others => Ntc114Fields.TypeOfRadioService.Others,
            _ => Ntc114Fields.TypeOfRadioService.FixedAndLandMobile
        };
        items.Add(new CheckboxFieldOverlay(radioServiceField, true));

        if (app.TypeOfRadioService == TypeOfRadioService114.Others && !string.IsNullOrWhiteSpace(app.TypeOfRadioServiceOther))
        {
            items.Add(new TextFieldOverlay(Ntc114Fields.TypeOfRadioService.OtherDetails, app.TypeOfRadioServiceOther));
        }

        // 3. CLASS OF STATION
        var cs = app.ClassOfStation;
        if (cs.RT > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.RT, cs.RT.ToString()));
        if (cs.FX > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.FX, cs.FX.ToString()));
        if (cs.FB > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.FB, cs.FB.ToString()));
        if (cs.ML > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.ML, cs.ML.ToString()));
        if (cs.P > 0)  items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.P,  cs.P.ToString()));
        if (cs.BC > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.BC, cs.BC.ToString()));

        if (cs.FA > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.FA, cs.FA.ToString()));
        if (cs.MA > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.MA, cs.MA.ToString()));
        if (cs.TC > 0) items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.TC, cs.TC.ToString()));
        if (!string.IsNullOrWhiteSpace(cs.Other))
        {
            items.Add(new CheckboxFieldOverlay(Ntc114Fields.ClassOfStation.OtherCheck, true));
            items.Add(new TextFieldOverlay(Ntc114Fields.ClassOfStation.OtherDetails, cs.Other));
        }

        // 4. APPLICANT DETAILS
        var a = app.Applicant;
        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.Name, a.Name));
        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.UnitRoomBldgNo, a.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.Street, a.Address.Street));

        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.Barangay, a.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.CityMunicipality, a.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.Province, a.Address.Province));
        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.ZipCode, a.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.ContactNumber, a.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc114Fields.Applicant.Email, a.Email));

        // 5. STATION PARTICULARS
        var st = app.ProposedStation;
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.ExactLocation, st.ExactLocation));
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.Longitude, st.Longitude));
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.Latitude, st.Latitude));
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.PointsOfCommServiceArea, st.PointsOfCommServiceArea));
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.AssignedFreq, st.AssignedFreq));
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.BwEmission, st.BwEmission));
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.DataRate, st.DataRate));
        items.Add(new TextFieldOverlay(Ntc114Fields.ProposedStation.Others, st.Others));

        // 6. EQUIPMENT PARTICULARS
        var eq = app.Equipment;
        string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
            ? $"{eq.Make} {eq.TypeModel}".Trim()
            : eq.RadioEquipment;

        items.Add(new TextFieldOverlay(Ntc114Fields.Equipment.MakeModel, makeModel));
        items.Add(new TextFieldOverlay(Ntc114Fields.Equipment.SerialNumber, eq.SerialNumber));
        items.Add(new TextFieldOverlay(Ntc114Fields.Equipment.PowerOutput, eq.PowerOutput));
        items.Add(new TextFieldOverlay(Ntc114Fields.Equipment.FrequencyRange, eq.FrequencyRange));

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc114Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }

        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc114Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 8. PAYMENT / OR BOX
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc114Fields.Payment.OrNo, app.Payment.OrNo));

            if (app.Payment.OrDate != default)
            {
                string dateStr = app.Payment.OrDate.ToString("MM/dd/yyyy");
                string[] parts = dateStr.Split('/');
                if (parts.Length == 3)
                {
                    items.Add(new TextFieldOverlay(Ntc114Fields.Payment.OrDateMonthDay, $"{parts[0]}/{parts[1]}"));
                    items.Add(new TextFieldOverlay(Ntc114Fields.Payment.OrDateYear, parts[2].Length == 4 ? parts[2].Substring(2) : parts[2]));
                }
                else
                {
                    items.Add(new TextFieldOverlay(Ntc114Fields.Payment.OrDateMonthDay, dateStr));
                }
            }

            if (app.Payment.Amount > 0)
            {
                items.Add(new TextFieldOverlay(Ntc114Fields.Payment.Amount, app.Payment.Amount.ToString("N2")));
            }

            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc114Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc114Application app)
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
