using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-19 (Certificate of Registration Application).
/// </summary>
public static class Ntc119FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(CertificateOfRegistrationApplication app)
    {
        var items = new List<FieldOverlay>();

        // 1. Equipment Device Type Checkmark
        var checkField = app.EquipmentDeviceType switch
        {
            EquipmentDeviceType.WdnIndoor => Ntc119Fields.EquipmentDeviceType.WdnIndoor,
            EquipmentDeviceType.Srd => Ntc119Fields.EquipmentDeviceType.Srd,
            EquipmentDeviceType.Rfid => Ntc119Fields.EquipmentDeviceType.Rfid,
            EquipmentDeviceType.Srrs => Ntc119Fields.EquipmentDeviceType.Srrs,
            EquipmentDeviceType.PublicTrunkedRadioMobilePortable => Ntc119Fields.EquipmentDeviceType.PublicTrunkedRadio,
            _ => Ntc119Fields.EquipmentDeviceType.WdnIndoor
        };
        items.Add(new CheckboxFieldOverlay(checkField, true));

        // 2. Applicant Details
        var a = app.Applicant;
        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.Name, a.Name));

        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.UnitRoomBldgNo, a.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.Street, a.Address.Street));

        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.Barangay, a.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.CityMunicipality, a.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.Province, a.Address.Province));
        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.ZipCode, a.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.ContactNumber, a.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.Email, a.Email));

        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.PermitToImportNo, app.PermitToImportNo));
        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.InvoiceNo, app.InvoiceNo));

        items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.CpcnPaRslNo, app.CpcnPaRslNo));
        if (app.Validity != default)
        {
            items.Add(new TextFieldOverlay(Ntc119Fields.Applicant.Validity, app.Validity.ToString("MM/dd/yy")));
        }

        // 3. Particulars of Equipment & Devices (Up to 11 rows)
        for (int i = 0; i < app.Devices.Count && i < 11; i++)
        {
            var dev = app.Devices[i];
            items.Add(new TextFieldOverlay(Ntc119Fields.Devices.MakeTypeModel(i), dev.MakeTypeModel));
            items.Add(new TextFieldOverlay(Ntc119Fields.Devices.Quantity(i), dev.Quantity.ToString()));
            items.Add(new TextFieldOverlay(Ntc119Fields.Devices.SerialNumber(i), dev.SerialNumber));
        }

        // Summary Total Quantity
        items.Add(new TextFieldOverlay(Ntc119Fields.Devices.TotalQuantity, app.TotalQuantity.ToString()));

        // 4. Signatures & Official Receipt Box
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc119Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc119Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc119Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc119Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc119Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc119Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc119Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(CertificateOfRegistrationApplication app)
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
