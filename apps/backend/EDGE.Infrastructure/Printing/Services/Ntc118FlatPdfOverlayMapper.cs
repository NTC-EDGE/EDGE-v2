using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Declarative field overlay mapper for NTC Form 1-18 (Commercial RCE & Mobile Phone Permits).
/// </summary>
public static class Ntc118FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc118Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. TYPE OF APPLICATION
        var actionField = app.TypeOfApplication switch
        {
            TypeOfApplication.New => Ntc118Fields.TypeOfApplication.New,
            TypeOfApplication.Renewal => Ntc118Fields.TypeOfApplication.Renewal,
            TypeOfApplication.Modification => Ntc118Fields.TypeOfApplication.Modification,
            _ => Ntc118Fields.TypeOfApplication.New
        };
        items.Add(new CheckboxFieldOverlay(actionField, true));

        if (app.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(app.ModificationReason))
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.TypeOfApplication.ModificationReason, app.ModificationReason));
        }

        // PERMIT CATEGORY SELECTION
        var pc = app.PermitCategory;
        if (pc != null)
        {
            // Radio Communications Equipment (RCE)
            if (pc.RceCategory) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.RceCategory, true));
            if (pc.RceDealer) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.RceDealer, true));
            if (pc.RceDealerTransceiver) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.RceDealerTransceiver, true));
            if (pc.RceDealerWdnIndoorSrdRfid) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.RceDealerWdnIndoorSrdRfid, true));
            if (pc.RceManufacturer) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.RceManufacturer, true));
            if (pc.RceServiceCenter) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.RceServiceCenter, true));

            // Mobile Phone
            if (pc.MobilePhoneCategory) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.MobilePhoneCategory, true));
            if (pc.MpDealer) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.MpDealer, true));
            if (pc.MpRetailerReseller) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.MpRetailerReseller, true));
            if (pc.MpServiceCenter) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.MpServiceCenter, true));

            // CPE Supplier Accreditation
            if (pc.CpeSupplierAccreditation) items.Add(new CheckboxFieldOverlay(Ntc118Fields.PermitCategory.CpeSupplierAccreditation, true));
        }

        // 2. APPLICANT'S DETAILS
        if (!string.IsNullOrWhiteSpace(app.Applicant.Name))
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.Name, app.Applicant.Name));

        var entityField = app.Applicant.TypeOfEntity switch
        {
            EntityType.Corporation => Ntc118Fields.Applicant.Corporation,
            EntityType.SingleProprietorship => Ntc118Fields.Applicant.SingleProprietorship,
            EntityType.Partnership => Ntc118Fields.Applicant.Partnership,
            EntityType.Other => Ntc118Fields.Applicant.OtherEntity,
            _ => Ntc118Fields.Applicant.Corporation
        };
        items.Add(new CheckboxFieldOverlay(entityField, true));

        if (app.Applicant.TypeOfEntity == EntityType.Other && !string.IsNullOrWhiteSpace(app.EntityTypeOther))
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.EntityTypeOther, app.EntityTypeOther));
        }

        if (!string.IsNullOrWhiteSpace(app.ExistingPermitNo))
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.ExistingPermitNo, app.ExistingPermitNo));

        if (app.ExistingPermitValidity != default)
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.ExistingPermitValidity, app.ExistingPermitValidity.ToString("MM/dd/yy")));

        var addr = app.Applicant.Address;
        if (addr != null)
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.UnitRoomBldgNo, addr.UnitRoomBldgNo));
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.Street, addr.Street));

            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.Barangay, addr.Barangay));
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.CityMunicipality, addr.CityMunicipality));

            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.Province, addr.Province));
            items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.ZipCode, addr.ZipCode));
        }

        items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.ContactNumber, app.Applicant.ContactNumber));
        items.Add(new TextFieldOverlay(Ntc118Fields.Applicant.Email, app.Applicant.Email));

        // 3. PERSONNEL REQUIRED
        if (app.SupervisingEngineer != null)
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.Personnel.EngineerName, app.SupervisingEngineer.Name));
            items.Add(new TextFieldOverlay(Ntc118Fields.Personnel.EngineerLicenseNo, app.SupervisingEngineer.LicenseNo));
            if (app.SupervisingEngineer.ValidityDate != default)
                items.Add(new TextFieldOverlay(Ntc118Fields.Personnel.EngineerValidity, app.SupervisingEngineer.ValidityDate.ToString("MM/dd/yy")));
        }

        if (app.Technician != null)
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.Personnel.TechName, app.Technician.Name));
            items.Add(new TextFieldOverlay(Ntc118Fields.Personnel.TechLicenseNo, app.Technician.LicenseNo));
            if (app.Technician.ValidityDate != default)
                items.Add(new TextFieldOverlay(Ntc118Fields.Personnel.TechValidity, app.Technician.ValidityDate.ToString("MM/dd/yy")));
        }

        // 4. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }

        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 5. PAYMENT / OR BOX
        if (app.Payment != null)
        {
            items.Add(new TextFieldOverlay(Ntc118Fields.Payment.OrNo, app.Payment.OrNo));

            if (app.Payment.OrDate != default)
            {
                string dateStr = app.Payment.OrDate.ToString("MM/dd/yyyy");
                string[] parts = dateStr.Split('/');
                if (parts.Length == 3)
                {
                    items.Add(new TextFieldOverlay(Ntc118Fields.Payment.OrDateMonthDay, $"{parts[0]}/{parts[1]}"));
                    items.Add(new TextFieldOverlay(Ntc118Fields.Payment.OrDateYear, parts[2].Length == 4 ? parts[2].Substring(2) : parts[2]));
                }
                else
                {
                    items.Add(new TextFieldOverlay(Ntc118Fields.Payment.OrDateMonthDay, dateStr));
                }
            }

            if (app.Payment.Amount > 0)
                items.Add(new TextFieldOverlay(Ntc118Fields.Payment.Amount, app.Payment.Amount.ToString("N2")));

            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc118Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible adapter method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc118Application app)
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
