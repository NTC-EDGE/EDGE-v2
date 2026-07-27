using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-04 (Application for Ship Radio Station License).
/// </summary>
public static class Ntc104FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc104Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. TYPE OF APPLICATION
        var actionField = app.TypeOfApplication switch
        {
            TypeOfApplication.New => Ntc104Fields.TypeOfApplication.New,
            TypeOfApplication.Renewal => Ntc104Fields.TypeOfApplication.Renewal,
            TypeOfApplication.Modification => Ntc104Fields.TypeOfApplication.Modification,
            _ => Ntc104Fields.TypeOfApplication.New
        };
        items.Add(new CheckboxFieldOverlay(actionField, true));

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextFieldOverlay(Ntc104Fields.TypeOfApplication.ModificationReason, app.ModificationReason));
        }

        if (app.NoOfYears.HasValue)
        {
            items.Add(new TextFieldOverlay(Ntc104Fields.TypeOfApplication.NoOfYears, app.NoOfYears.Value.ToString()));
        }

        // 2. TYPE OF PERMIT / LICENSE / CERTIFICATE
        var permitCertField = app.TypeOfPermitLicenseCert switch
        {
            TypeOfPermitLicenseCert104.ShipStationLicense => Ntc104Fields.TypeOfPermitLicenseCert.ShipStationLicense,
            TypeOfPermitLicenseCert104.ShipEarthStationLicense => Ntc104Fields.TypeOfPermitLicenseCert.ShipEarthStationLicense,
            TypeOfPermitLicenseCert104.CargoShipSafetyRadioCertificate => Ntc104Fields.TypeOfPermitLicenseCert.CargoShipSafetyRadioCertificate,
            TypeOfPermitLicenseCert104.TemporaryPermit => Ntc104Fields.TypeOfPermitLicenseCert.TemporaryPermit,
            TypeOfPermitLicenseCert104.FerryingPermit => Ntc104Fields.TypeOfPermitLicenseCert.FerryingPermit,
            _ => Ntc104Fields.TypeOfPermitLicenseCert.ShipStationLicense
        };
        items.Add(new CheckboxFieldOverlay(permitCertField, true));

        // Vessel Category
        var vesselField = app.VesselCategory switch
        {
            VesselCategory.Ship => Ntc104Fields.TypeOfPermitLicenseCert.VesselShip,
            VesselCategory.Aircraft => Ntc104Fields.TypeOfPermitLicenseCert.VesselAircraft,
            VesselCategory.Others => Ntc104Fields.TypeOfPermitLicenseCert.VesselOthers,
            _ => Ntc104Fields.TypeOfPermitLicenseCert.VesselShip
        };
        items.Add(new CheckboxFieldOverlay(vesselField, true));

        if (app.VesselCategory == VesselCategory.Others && !string.IsNullOrWhiteSpace(app.OtherVesselCategoryDetails))
        {
            items.Add(new TextFieldOverlay(Ntc104Fields.TypeOfPermitLicenseCert.OtherVesselCategoryDetails, app.OtherVesselCategoryDetails));
        }

        // Trading Route
        var routeField = app.TradingRoute == TradingRoute.Domestic ? Ntc104Fields.TypeOfPermitLicenseCert.RouteDomestic : Ntc104Fields.TypeOfPermitLicenseCert.RouteInternational;
        items.Add(new CheckboxFieldOverlay(routeField, true));

        // 3. APPLICANT'S DETAILS
        var a = app.Applicant;
        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.Name, a.Name));

        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.UnitRoomBldgNo, a.Address.UnitRoomBldgNo));
        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.Street, a.Address.Street));

        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.Barangay, a.Address.Barangay));
        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.CityMunicipality, a.Address.CityMunicipality));

        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.Province, a.Address.Province));
        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.ZipCode, a.Address.ZipCode));

        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.ContactNumber, a.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc104Fields.Applicant.Email, a.Email));

        // 4. SHIP DETAILS
        var sh = app.ShipDetails;
        items.Add(new TextFieldOverlay(Ntc104Fields.ShipDetails.NameOfShipVessel, sh.NameOfShipVessel));
        items.Add(new TextFieldOverlay(Ntc104Fields.ShipDetails.CallSign, sh.CallSign));

        items.Add(new TextFieldOverlay(Ntc104Fields.ShipDetails.MmsiNo, sh.MmsiNo));
        items.Add(new TextFieldOverlay(Ntc104Fields.ShipDetails.StationLicenseNo, sh.StationLicenseNo));

        items.Add(new TextFieldOverlay(Ntc104Fields.ShipDetails.ImoNo, sh.ImoNo));
        if (sh.Validity != default)
        {
            items.Add(new TextFieldOverlay(Ntc104Fields.ShipDetails.Validity, sh.Validity.ToString("MM/dd/yy")));
        }

        // 5. PARTICULARS OF EQUIPMENT
        for (int i = 0; i < app.Equipment.Count && i < 5; i++)
        {
            var eq = app.Equipment[i];
            var (radioField, makeField, typeField, serialField, powerField) = i switch
            {
                0 => (Ntc104Fields.Equipment.RadioEquipmentRow1, Ntc104Fields.Equipment.MakeRow1, Ntc104Fields.Equipment.TypeModelRow1, Ntc104Fields.Equipment.SerialNumberRow1, Ntc104Fields.Equipment.PowerOutputRow1),
                1 => (Ntc104Fields.Equipment.RadioEquipmentRow2, Ntc104Fields.Equipment.MakeRow2, Ntc104Fields.Equipment.TypeModelRow2, Ntc104Fields.Equipment.SerialNumberRow2, Ntc104Fields.Equipment.PowerOutputRow2),
                2 => (Ntc104Fields.Equipment.RadioEquipmentRow3, Ntc104Fields.Equipment.MakeRow3, Ntc104Fields.Equipment.TypeModelRow3, Ntc104Fields.Equipment.SerialNumberRow3, Ntc104Fields.Equipment.PowerOutputRow3),
                3 => (Ntc104Fields.Equipment.RadioEquipmentRow4, Ntc104Fields.Equipment.MakeRow4, Ntc104Fields.Equipment.TypeModelRow4, Ntc104Fields.Equipment.SerialNumberRow4, Ntc104Fields.Equipment.PowerOutputRow4),
                _ => (Ntc104Fields.Equipment.RadioEquipmentRow5, Ntc104Fields.Equipment.MakeRow5, Ntc104Fields.Equipment.TypeModelRow5, Ntc104Fields.Equipment.SerialNumberRow5, Ntc104Fields.Equipment.PowerOutputRow5)
            };

            items.Add(new TextFieldOverlay(radioField, eq.RadioEquipment));
            items.Add(new TextFieldOverlay(makeField, eq.Make));
            items.Add(new TextFieldOverlay(typeField, eq.TypeModel));
            items.Add(new TextFieldOverlay(serialField, eq.SerialNumber));
            items.Add(new TextFieldOverlay(powerField, eq.PowerOutput));
        }

        // 6. PARTICULARS OF OPERATORS
        if (app.Operators.Count > 0)
        {
            var op1 = app.Operators[0];
            items.Add(new TextFieldOverlay(Ntc104Fields.Operators.Op1Name, op1.Name));
            items.Add(new TextFieldOverlay(Ntc104Fields.Operators.Op1CertNo, op1.CertificateNumber));
            if (op1.Validity != default)
            {
                items.Add(new TextFieldOverlay(Ntc104Fields.Operators.Op1Validity, op1.Validity.ToString("MM/dd/yy")));
            }
        }
        if (app.Operators.Count > 1)
        {
            var op2 = app.Operators[1];
            items.Add(new TextFieldOverlay(Ntc104Fields.Operators.Op2Name, op2.Name));
            items.Add(new TextFieldOverlay(Ntc104Fields.Operators.Op2CertNo, op2.CertificateNumber));
            if (op2.Validity != default)
            {
                items.Add(new TextFieldOverlay(Ntc104Fields.Operators.Op2Validity, op2.Validity.ToString("MM/dd/yy")));
            }
        }

        // 7. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc104Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }
        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc104Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 8. OFFICIAL RECEIPT BOX
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc104Fields.Payment.OrNo, app.Payment.OrNo));
            if (app.Payment.OrDate != default)
            {
                items.Add(new TextFieldOverlay(Ntc104Fields.Payment.OrDateMonthDay, app.Payment.OrDate.ToString("MM/dd")));
                items.Add(new TextFieldOverlay(Ntc104Fields.Payment.OrDateYear, app.Payment.OrDate.ToString("yy")));
            }
            items.Add(new TextFieldOverlay(Ntc104Fields.Payment.Amount, $"PHP {app.Payment.Amount:N2}"));
            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc104Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc104Application app)
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
