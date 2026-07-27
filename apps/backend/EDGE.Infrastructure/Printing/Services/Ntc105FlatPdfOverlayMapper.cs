using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-05 (Multiple Stations/Equipment Annex).
/// </summary>
public static class Ntc105FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc105Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. APPLICANT NAME
        if (!string.IsNullOrWhiteSpace(app.ApplicantName))
        {
            items.Add(new TextFieldOverlay(Ntc105Fields.ApplicantName, app.ApplicantName));
        }

        // 2. PARTICULARS OF EQUIPMENT (Up to 32 rows)
        for (int i = 0; i < app.Equipment.Count && i < 32; i++)
        {
            var eq = app.Equipment[i];
            items.Add(new TextFieldOverlay(Ntc105Fields.Equipment.RadioEquipment(i), eq.RadioEquipment));
            items.Add(new TextFieldOverlay(Ntc105Fields.Equipment.Make(i), eq.Make));
            items.Add(new TextFieldOverlay(Ntc105Fields.Equipment.TypeModel(i), eq.TypeModel));
            items.Add(new TextFieldOverlay(Ntc105Fields.Equipment.SerialNumber(i), eq.SerialNumber));
            items.Add(new TextFieldOverlay(Ntc105Fields.Equipment.PowerOutput(i), eq.PowerOutput));
        }

        // 3. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc105Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc105Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc105Application app)
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
