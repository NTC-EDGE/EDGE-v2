using System.Collections.Generic;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-11 (Application for Construction Permit).
/// </summary>
public static class Ntc111FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(ConstructionPermitApplication app)
    {
        var items = new List<FieldOverlay>();

        // 1. TYPE OF APPLICATION
        var subtypeField = app.PermitSubtype == PermitSubtype.RadioStationLicense ? Ntc111Fields.PermitSubtype.RadioStationLicense : Ntc111Fields.PermitSubtype.ConstructionPermit;
        items.Add(new CheckboxFieldOverlay(subtypeField, true));

        var actionField = app.TypeOfApplication switch
        {
            TypeOfApplication.New => Ntc111Fields.TypeOfApplication.New,
            TypeOfApplication.Renewal => Ntc111Fields.TypeOfApplication.Renewal,
            TypeOfApplication.Modification => Ntc111Fields.TypeOfApplication.Modification,
            _ => Ntc111Fields.TypeOfApplication.New
        };
        items.Add(new CheckboxFieldOverlay(actionField, true));

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.TypeOfApplication.ModificationReason, app.ModificationReason));
        }

        // 2. TYPE OF RADIO SERVICE
        var radioServiceField = app.TypeOfRadioService switch
        {
            TypeOfRadioService.FixedAndLandMobile => Ntc111Fields.TypeOfRadioService.FixedAndLandMobile,
            TypeOfRadioService.Aeronautical => Ntc111Fields.TypeOfRadioService.Aeronautical,
            TypeOfRadioService.MaritimePublicPrivateCoastal => Ntc111Fields.TypeOfRadioService.MaritimePublicPrivateCoastal,
            TypeOfRadioService.Broadcast => Ntc111Fields.TypeOfRadioService.Broadcast,
            TypeOfRadioService.Other => Ntc111Fields.TypeOfRadioService.Other,
            _ => Ntc111Fields.TypeOfRadioService.FixedAndLandMobile
        };
        items.Add(new CheckboxFieldOverlay(radioServiceField, true));

        // 3. NATURE OF SERVICE & NO. OF YEARS
        if (app.NoOfYears.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.NatureOfService.NoOfYears, app.NoOfYears.Value.ToString()));
        }

        var natureField = app.NatureOfService switch
        {
            NatureOfService.CvPrivate => Ntc111Fields.NatureOfService.CvPrivate,
            NatureOfService.CoGovernment => Ntc111Fields.NatureOfService.CoGovernment,
            NatureOfService.CpPublicCorrespondence => Ntc111Fields.NatureOfService.CpPublicCorrespondence,
            _ => Ntc111Fields.NatureOfService.CvPrivate
        };
        items.Add(new CheckboxFieldOverlay(natureField, true));

        // 4. CLASS OF STATION
        if (app.ClassOfStation != null)
        {
            var stationCounts = new (string code, int count, PdfField field)[]
            {
                ("RT", app.ClassOfStation.RT, Ntc111Fields.ClassOfStation.RT),
                ("ML", app.ClassOfStation.ML, Ntc111Fields.ClassOfStation.ML),
                ("FC", app.ClassOfStation.FC, Ntc111Fields.ClassOfStation.FC),
                ("TC", app.ClassOfStation.TC, Ntc111Fields.ClassOfStation.TC),
                ("FX", app.ClassOfStation.FX, Ntc111Fields.ClassOfStation.FX),
                ("P",  app.ClassOfStation.P,  Ntc111Fields.ClassOfStation.P),
                ("FA", app.ClassOfStation.FA, Ntc111Fields.ClassOfStation.FA),
                ("FB", app.ClassOfStation.FB, Ntc111Fields.ClassOfStation.FB),
                ("BC", app.ClassOfStation.BC, Ntc111Fields.ClassOfStation.BC),
                ("MA", app.ClassOfStation.MA, Ntc111Fields.ClassOfStation.MA)
            };

            foreach (var (_, count, field) in stationCounts)
            {
                if (count > 0)
                {
                    items.Add(new TextFieldOverlay(field, count.ToString()));
                }
            }

            if (!string.IsNullOrWhiteSpace(app.ClassOfStation.Other))
            {
                items.Add(new TextFieldOverlay(Ntc111Fields.ClassOfStation.Other, app.ClassOfStation.Other));
            }
        }

        // 5. APPLICANT'S DETAILS
        var a = app.Applicant;
        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.Name, a.Name));
        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.UnitRoomBldgNo, a.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.Street, a.Address.Street));

        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.Barangay, a.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.CityMunicipality, a.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.Province, a.Address.Province));
        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.ZipCode, a.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.ContactNumber, a.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc111Fields.Applicant.Email, a.Email));

        // 6. PARTICULARS OF STATION / EQUIPMENT / ANTENNA
        var st = app.Stations.FirstOrDefault() ?? new Station();
        var eq = app.Equipment.FirstOrDefault() ?? new Equipment();
        var ant = st.Antenna ?? new Antenna();

        string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
            ? $"{eq.Make} {eq.TypeModel}".Trim()
            : eq.RadioEquipment;

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.ExactLocation, st.ExactLocation));
        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.MakeModel, makeModel));

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.Longitude, st.Longitude));
        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.Latitude, st.Latitude));
        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.SerialNumber, eq.SerialNumber));

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.PointsOfCommServiceArea, st.PointsOfCommServiceArea));
        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.PowerOutput, eq.PowerOutput));
        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.FrequencyRange, eq.FrequencyRange));

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AssignedFreq, st.AssignedFreq));

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.BwEmission, st.BwEmission));
        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AntennaType, ant.Type));

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.Configuration, st.Configuration));
        if (ant.HeightM > 0)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AntennaHeightM, ant.HeightM.ToString("F1")));
        }
        if (ant.GainDbi > 0)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AntennaGainDbi, ant.GainDbi.ToString("F1")));
        }

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.DataRate, st.DataRate));
        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.CallSign, st.CallSign));
        if (ant.DirectivityDegrees > 0)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AntennaDirectivity, $"{ant.DirectivityDegrees:F0}°"));
        }
        if (!string.IsNullOrWhiteSpace(ant.Polarization))
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AntennaPolarization, ant.Polarization));
        }
        if (ant.BeamwidthDegrees > 0)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AntennaBeamwidth, $"{ant.BeamwidthDegrees:F0}°"));
        }

        items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.RslNo, st.RslNo));

        if (st.Validity != default)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.Validity, st.Validity.ToString("MM/dd/yy")));
        }

        if (!string.IsNullOrWhiteSpace(st.Others))
        {
            string notes = st.Others.Length > 45 ? st.Others.Substring(0, 42) + "..." : st.Others;
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.Notes, notes));
        }
        if (!string.IsNullOrWhiteSpace(ant.Diameter))
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.ProposedStation.AntennaDiameter, ant.Diameter));
        }

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 8. OFFICIAL RECEIPT BOX
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc111Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc111Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc111Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc111Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc111Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(ConstructionPermitApplication app)
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
