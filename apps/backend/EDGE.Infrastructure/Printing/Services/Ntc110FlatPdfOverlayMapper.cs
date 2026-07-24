using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-10 (Commercial Radio Station License Annex).
/// </summary>
public static class Ntc110FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc110Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. APPLICANT NAME
        if (!string.IsNullOrWhiteSpace(app.ApplicantName))
        {
            items.Add(new TextFieldOverlay(Ntc110Fields.ApplicantName, app.ApplicantName));
        }

        // 2. MULTI-COLUMN ENTRIES (Up to 4 columns)
        int colCount = app.Entries.Count > 0 ? System.Math.Min(app.Entries.Count, 4) : 1;

        for (int c = 0; c < colCount; c++)
        {
            var entry = app.Entries[c];

            // STATION ROWS
            var st = entry.ProposedStation;
            var (row0, row1, row2, row3, row4, row5, row6, row7, row8, row9, row10, row11, row12) = (
                st.ExactLocation, st.Longitude, st.Latitude, st.PointsOfCommServiceArea, st.ServiceArea,
                st.AssignedFreq, st.BwEmission, st.Configuration, st.DataRate, st.CallSign,
                st.RslNo, st.Validity != default ? st.Validity.ToString("MM/dd/yy") : "", st.Others
            );

            string[] stationLabels = { "ExactLocation", "Longitude", "Latitude", "PointsOfComm", "ServiceArea", "AssignedFreq", "BwEmission", "Configuration", "DataRate", "CallSign", "RslNo", "Validity", "Others" };
            string[] stationVals = { row0, row1, row2, row3, row4, row5, row6, row7, row8, row9, row10, row11, row12 };

            for (int r = 0; r < stationVals.Length; r++)
            {
                if (!string.IsNullOrEmpty(stationVals[r]))
                {
                    items.Add(new TextFieldOverlay(Ntc110Fields.StationField(c, r, stationLabels[r], isBold: r == 9), stationVals[r]));
                }
            }

            // EQUIPMENT ROWS
            var eq = entry.Equipment;
            string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
                ? $"{eq.Make} {eq.TypeModel}".Trim()
                : eq.RadioEquipment;

            string[] equipLabels = { "MakeModel", "SerialNumber", "PowerOutput", "FrequencyRange" };
            string[] equipVals = { makeModel, eq.SerialNumber, eq.PowerOutput, eq.FrequencyRange };

            for (int r = 0; r < equipVals.Length; r++)
            {
                if (!string.IsNullOrEmpty(equipVals[r]))
                {
                    items.Add(new TextFieldOverlay(Ntc110Fields.EquipmentField(c, r, equipLabels[r]), equipVals[r]));
                }
            }

            // ANTENNA ROWS
            var ant = entry.Antenna;
            string[] antLabels = { "Type", "Height", "Gain", "Directivity", "Diameter", "Polarization", "Beamwidth" };
            string[] antVals =
            {
                ant.Type,
                ant.HeightM > 0 ? $"{ant.HeightM} m" : "",
                ant.GainDbi > 0 ? $"{ant.GainDbi} dBi" : "",
                ant.DirectivityDegrees > 0 ? $"{ant.DirectivityDegrees}°" : "",
                ant.Diameter,
                ant.Polarization,
                ant.BeamwidthDegrees > 0 ? $"{ant.BeamwidthDegrees}°" : ""
            };

            for (int r = 0; r < antVals.Length; r++)
            {
                if (!string.IsNullOrEmpty(antVals[r]))
                {
                    items.Add(new TextFieldOverlay(Ntc110Fields.AntennaField(c, r, antLabels[r]), antVals[r]));
                }
            }
        }

        // 3. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc110Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc110Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc110Application app)
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
