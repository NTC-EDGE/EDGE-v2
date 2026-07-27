using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

public static class Ntc120FlatPdfOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(Ntc120Application app)
    {
        var items = new List<FieldOverlay>();

        // 1. TYPE OF APPLICATION
        switch (app.TypeOfApplication)
        {
            case TypeOfApplication.New:
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.TypeOfApplication.New, true));
                break;
            case TypeOfApplication.Renewal:
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.TypeOfApplication.Renewal, true));
                break;
            case TypeOfApplication.Modification:
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.TypeOfApplication.Modification, true));
                if (!string.IsNullOrWhiteSpace(app.ModificationReason))
                {
                    items.Add(new TextFieldOverlay(Ntc120Fields.TypeOfApplication.ModificationReason, app.ModificationReason));
                }
                break;
        }

        // REGISTRATION CATEGORIES
        var cat = app.RegistrationCategory;
        if (cat != null)
        {
            if (cat.VasProvider) items.Add(new CheckboxFieldOverlay(Ntc120Fields.RegistrationCategory.VasProvider, true));
            if (cat.PcsotspProvider) items.Add(new CheckboxFieldOverlay(Ntc120Fields.RegistrationCategory.PcsotspProvider, true));
            if (cat.VoipProvider || cat.VoipReseller) items.Add(new CheckboxFieldOverlay(Ntc120Fields.RegistrationCategory.VoipProviderOrReseller, true));
            if (cat.VoipProvider) items.Add(new CheckboxFieldOverlay(Ntc120Fields.RegistrationCategory.VoipProvider, true));
            if (cat.VoipReseller) items.Add(new CheckboxFieldOverlay(Ntc120Fields.RegistrationCategory.VoipReseller, true));
        }

        // 2. APPLICANT'S DETAILS
        if (!string.IsNullOrWhiteSpace(app.Applicant.Name))
            items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.Name, app.Applicant.Name));

        var addr = app.Applicant.Address;
        if (addr != null)
        {
            if (!string.IsNullOrWhiteSpace(addr.UnitRoomBldgNo))
                items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.UnitRoomBldgNo, addr.UnitRoomBldgNo));

            if (!string.IsNullOrWhiteSpace(addr.Street))
                items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.Street, addr.Street));

            if (!string.IsNullOrWhiteSpace(addr.Barangay))
                items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.Barangay, addr.Barangay));

            if (!string.IsNullOrWhiteSpace(addr.CityMunicipality))
                items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.CityMunicipality, addr.CityMunicipality));

            if (!string.IsNullOrWhiteSpace(addr.Province))
                items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.Province, addr.Province));

            if (!string.IsNullOrWhiteSpace(addr.ZipCode))
                items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.ZipCode, addr.ZipCode));
        }

        if (!string.IsNullOrWhiteSpace(app.Applicant.ContactNumber))
            items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.ContactNumber, app.Applicant.ContactNumber));

        if (!string.IsNullOrWhiteSpace(app.Applicant.Email))
            items.Add(new TextFieldOverlay(Ntc120Fields.Applicant.Email, app.Applicant.Email));

        // Entity Type
        switch (app.Applicant.TypeOfEntity)
        {
            case EntityType.Corporation:
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.EntityType.Corporation, true));
                break;
            case EntityType.SingleProprietorship:
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.EntityType.SingleProprietorship, true));
                break;
            case EntityType.Partnership:
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.EntityType.Partnership, true));
                break;
            case EntityType.Other:
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.EntityType.Other, true));
                if (!string.IsNullOrWhiteSpace(app.EntityTypeOther))
                {
                    items.Add(new TextFieldOverlay(Ntc120Fields.EntityType.OtherSpecify, app.EntityTypeOther));
                }
                break;
        }

        if (!string.IsNullOrWhiteSpace(app.CpcnPaCaNo))
            items.Add(new TextFieldOverlay(Ntc120Fields.Permits.CpcnPaCaNo, app.CpcnPaCaNo));

        if (app.CpcnPaCaValidity != default)
            items.Add(new TextFieldOverlay(Ntc120Fields.Permits.CpcnPaCaValidity, app.CpcnPaCaValidity.ToString("MM/dd/yy")));

        if (!string.IsNullOrWhiteSpace(app.CorNo))
            items.Add(new TextFieldOverlay(Ntc120Fields.Permits.CorNo, app.CorNo));

        if (app.CorValidity != default)
            items.Add(new TextFieldOverlay(Ntc120Fields.Permits.CorValidity, app.CorValidity.ToString("MM/dd/yy")));

        // Former Name
        if (app.FormerNameInfo != null)
        {
            if (app.FormerNameInfo.IsKnownByFormerName)
            {
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.FormerName.IsKnownYes, true));
                if (!string.IsNullOrWhiteSpace(app.FormerNameInfo.FormerName))
                {
                    items.Add(new TextFieldOverlay(Ntc120Fields.FormerName.FormerNameValue, app.FormerNameInfo.FormerName));
                }
            }
            else
            {
                items.Add(new CheckboxFieldOverlay(Ntc120Fields.FormerName.IsKnownNo, true));
            }
        }

        // 3. VAS SERVICES SELECTION
        var vas = app.VasServices;
        if (vas != null)
        {
            if (vas.MessagingService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.MessagingService, true));
            if (vas.AudioConferencing) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.AudioConferencing, true));
            if (vas.AudioAndVideoConferencing) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.AudioAndVideoConferencing, true));
            if (vas.VoiceMailService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.VoiceMailService, true));
            if (vas.ElectronicMailService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.ElectronicMailService, true));
            if (vas.InformationService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.InformationService, true));
            if (vas.ApplicationService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.ApplicationService, true));

            if (vas.ContentAndProgramService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.ContentAndProgramService, true));
            if (vas.AudiotextService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.AudiotextService, true));
            if (vas.FacsimileService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.FacsimileService, true));
            if (vas.VirtualPrivateNetworkService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.VirtualPrivateNetworkService, true));
            if (vas.HostingService) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.HostingService, true));
            if (vas.ElectronicGamingServices) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.ElectronicGamingServices, true));
            if (vas.Others) items.Add(new CheckboxFieldOverlay(Ntc120Fields.VasServices.Others, true));

            if (!string.IsNullOrWhiteSpace(vas.OthersSpecify))
            {
                items.Add(new TextFieldOverlay(Ntc120Fields.VasServices.OthersSpecify, vas.OthersSpecify));
            }
        }

        // 4. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            items.Add(new TextFieldOverlay(Ntc120Fields.Declaration.SignatoryName, app.Declaration.SignatoryName));
        }

        if (app.Declaration.DateAccomplished != default)
        {
            items.Add(new TextFieldOverlay(Ntc120Fields.Declaration.DateAccomplished, app.Declaration.DateAccomplished.ToString("MM/dd/yyyy")));
        }

        // 5. PAYMENT / OR BOX
        if (app.Payment != null)
        {
            if (!string.IsNullOrWhiteSpace(app.Payment.OrNo))
                items.Add(new TextFieldOverlay(Ntc120Fields.Payment.OrNo, app.Payment.OrNo));

            if (app.Payment.OrDate != default)
            {
                string dateStr = app.Payment.OrDate.ToString("MM/dd/yyyy");
                string[] parts = dateStr.Split('/');
                if (parts.Length == 3)
                {
                    items.Add(new TextFieldOverlay(Ntc120Fields.Payment.OrDateMonthDay, $"{parts[0]}/{parts[1]}"));
                    items.Add(new TextFieldOverlay(Ntc120Fields.Payment.OrDateYear, parts[2].Length == 4 ? parts[2].Substring(2) : parts[2]));
                }
                else
                {
                    items.Add(new TextFieldOverlay(Ntc120Fields.Payment.OrDateMonthDay, dateStr));
                }
            }

            if (app.Payment.Amount > 0)
                items.Add(new TextFieldOverlay(Ntc120Fields.Payment.Amount, app.Payment.Amount.ToString("N2")));

            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                items.Add(new TextFieldOverlay(Ntc120Fields.Payment.CollectingOfficer, app.Payment.CollectingOfficer));
            }
        }

        return items;
    }

    // Backward-compatible method
    public static List<TextOverlayItem> MapToOverlayItems(Ntc120Application app)
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
