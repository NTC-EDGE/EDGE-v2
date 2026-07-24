using System;
using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

public static class Ntc120FlatPdfOverlayMapper
{
    private const string CheckmarkChar = "\u2714";
    private const double RegularCharWidthFactor = 0.52;
    private const double BoldCharWidthFactor = 0.62;

    private static double EstimateTextWidth(string text, double fontSize, bool isBold)
    {
        if (string.IsNullOrEmpty(text)) return 0;
        return text.Length * fontSize * (isBold ? BoldCharWidthFactor : RegularCharWidthFactor);
    }

    private static double CenterX(double boxLeft, double boxRight, string text, double fontSize, bool isBold)
    {
        double width = EstimateTextWidth(text, fontSize, isBold);
        double boxCenter = (boxLeft + boxRight) / 2.0;
        return boxCenter - (width / 2.0);
    }

    public static List<TextOverlayItem> MapToOverlayItems(Ntc120Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. TYPE OF APPLICATION
        switch (app.TypeOfApplication)
        {
            case TypeOfApplication.New:
                items.Add(new TextOverlayItem { X = 68.7, Y = 247.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case TypeOfApplication.Renewal:
                items.Add(new TextOverlayItem { X = 68.7, Y = 262.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case TypeOfApplication.Modification:
                items.Add(new TextOverlayItem { X = 68.7, Y = 277.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                if (!string.IsNullOrWhiteSpace(app.ModificationReason))
                {
                    items.Add(new TextOverlayItem { X = 85.0, Y = 290.0, Text = app.ModificationReason, FontSize = 7.5 });
                }
                break;
        }

        // REGISTRATION CATEGORIES
        var cat = app.RegistrationCategory;
        if (cat != null)
        {
            if (cat.VasProvider) items.Add(new TextOverlayItem { X = 252.8, Y = 247.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (cat.PcsotspProvider) items.Add(new TextOverlayItem { X = 252.8, Y = 262.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (cat.VoipProvider || cat.VoipReseller) items.Add(new TextOverlayItem { X = 252.8, Y = 277.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (cat.VoipProvider) items.Add(new TextOverlayItem { X = 275.8, Y = 292.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (cat.VoipReseller) items.Add(new TextOverlayItem { X = 275.8, Y = 307.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
        }

        // 2. APPLICANT'S DETAILS
        if (!string.IsNullOrWhiteSpace(app.Applicant.Name))
            items.Add(new TextOverlayItem { X = 152.0, Y = 322.0, Text = app.Applicant.Name, FontSize = 8, IsBold = true });

        var addr = app.Applicant.Address;
        if (addr != null)
        {
            if (!string.IsNullOrWhiteSpace(addr.UnitRoomBldgNo))
                items.Add(new TextOverlayItem { X = 152.0, Y = 337.0, Text = addr.UnitRoomBldgNo, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.Street))
                items.Add(new TextOverlayItem { X = 405.0, Y = 337.0, Text = addr.Street, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.Barangay))
                items.Add(new TextOverlayItem { X = 152.0, Y = 352.0, Text = addr.Barangay, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.CityMunicipality))
                items.Add(new TextOverlayItem { X = 405.0, Y = 352.0, Text = addr.CityMunicipality, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.Province))
                items.Add(new TextOverlayItem { X = 152.0, Y = 367.0, Text = addr.Province, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.ZipCode))
                items.Add(new TextOverlayItem { X = 405.0, Y = 367.0, Text = addr.ZipCode, FontSize = 7.5 });
        }

        if (!string.IsNullOrWhiteSpace(app.Applicant.ContactNumber))
            items.Add(new TextOverlayItem { X = 152.0, Y = 382.0, Text = app.Applicant.ContactNumber, FontSize = 7.5 });

        if (!string.IsNullOrWhiteSpace(app.Applicant.Email))
            items.Add(new TextOverlayItem { X = 405.0, Y = 382.0, Text = app.Applicant.Email, FontSize = 7.5 });

        // Entity Type
        switch (app.Applicant.TypeOfEntity)
        {
            case EntityType.Corporation:
                items.Add(new TextOverlayItem { X = 115.2, Y = 394.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case EntityType.SingleProprietorship:
                items.Add(new TextOverlayItem { X = 115.2, Y = 409.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case EntityType.Partnership:
                items.Add(new TextOverlayItem { X = 345.3, Y = 394.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case EntityType.Other:
                items.Add(new TextOverlayItem { X = 345.3, Y = 409.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                if (!string.IsNullOrWhiteSpace(app.EntityTypeOther))
                {
                    items.Add(new TextOverlayItem { X = 428.0, Y = 409.0, Text = app.EntityTypeOther, FontSize = 7.5 });
                }
                break;
        }

        if (!string.IsNullOrWhiteSpace(app.CpcnPaCaNo))
            items.Add(new TextOverlayItem { X = 152.0, Y = 424.0, Text = app.CpcnPaCaNo, FontSize = 7.5 });

        if (app.CpcnPaCaValidity != default)
            items.Add(new TextOverlayItem { X = 474.0, Y = 424.0, Text = app.CpcnPaCaValidity.ToString("MM/dd/yy"), FontSize = 7.5 });

        if (!string.IsNullOrWhiteSpace(app.CorNo))
            items.Add(new TextOverlayItem { X = 152.0, Y = 439.0, Text = app.CorNo, FontSize = 7.5 });

        if (app.CorValidity != default)
            items.Add(new TextOverlayItem { X = 474.0, Y = 439.0, Text = app.CorValidity.ToString("MM/dd/yy"), FontSize = 7.5 });

        // Former Name
        if (app.FormerNameInfo != null)
        {
            if (app.FormerNameInfo.IsKnownByFormerName)
            {
                items.Add(new TextOverlayItem { X = 69.2, Y = 469.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                if (!string.IsNullOrWhiteSpace(app.FormerNameInfo.FormerName))
                {
                    items.Add(new TextOverlayItem { X = 221.0, Y = 469.0, Text = app.FormerNameInfo.FormerName, FontSize = 7.5 });
                }
            }
            else
            {
                items.Add(new TextOverlayItem { X = 69.2, Y = 484.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            }
        }

        // 3. VAS SERVICES SELECTION
        var vas = app.VasServices;
        if (vas != null)
        {
            if (vas.MessagingService) items.Add(new TextOverlayItem { X = 46.2, Y = 521.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.AudioConferencing) items.Add(new TextOverlayItem { X = 46.2, Y = 536.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.AudioAndVideoConferencing) items.Add(new TextOverlayItem { X = 46.2, Y = 551.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.VoiceMailService) items.Add(new TextOverlayItem { X = 46.2, Y = 566.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.ElectronicMailService) items.Add(new TextOverlayItem { X = 46.2, Y = 581.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.InformationService) items.Add(new TextOverlayItem { X = 46.2, Y = 596.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.ApplicationService) items.Add(new TextOverlayItem { X = 46.2, Y = 611.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });

            if (vas.ContentAndProgramService) items.Add(new TextOverlayItem { X = 276.3, Y = 521.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.AudiotextService) items.Add(new TextOverlayItem { X = 276.3, Y = 536.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.FacsimileService) items.Add(new TextOverlayItem { X = 276.3, Y = 551.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.VirtualPrivateNetworkService) items.Add(new TextOverlayItem { X = 276.3, Y = 566.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.HostingService) items.Add(new TextOverlayItem { X = 276.3, Y = 581.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.ElectronicGamingServices) items.Add(new TextOverlayItem { X = 276.3, Y = 596.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (vas.Others) items.Add(new TextOverlayItem { X = 276.3, Y = 611.0, Text = CheckmarkChar, FontSize = 10, IsBold = true });

            if (!string.IsNullOrWhiteSpace(vas.OthersSpecify))
            {
                items.Add(new TextOverlayItem { X = 290.0, Y = 626.0, Text = vas.OthersSpecify, FontSize = 7.5 });
            }
        }

        // 4. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(80.6, 333.9, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 723.8, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }

        if (app.Declaration.DateAccomplished != default)
        {
            string dateStr = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(80.6, 333.9, dateStr, 8, false);
            items.Add(new TextOverlayItem { X = dateX, Y = 737.8, Text = dateStr, FontSize = 8 });
        }

        // 5. PAYMENT / OR BOX
        if (app.Payment != null)
        {
            if (!string.IsNullOrWhiteSpace(app.Payment.OrNo))
                items.Add(new TextOverlayItem { X = 432.0, Y = 723.5, Text = app.Payment.OrNo, FontSize = 7.5 });

            if (app.Payment.OrDate != default)
            {
                string dateStr = app.Payment.OrDate.ToString("MM/dd/yyyy");
                string[] parts = dateStr.Split('/');
                if (parts.Length == 3)
                {
                    items.Add(new TextOverlayItem { X = 432.0, Y = 738.5, Text = $"{parts[0]}/{parts[1]}", FontSize = 7.5 });
                    items.Add(new TextOverlayItem { X = 530.0, Y = 738.5, Text = parts[2].Length == 4 ? parts[2].Substring(2) : parts[2], FontSize = 7.5 });
                }
                else
                {
                    items.Add(new TextOverlayItem { X = 432.0, Y = 738.5, Text = dateStr, FontSize = 7.5 });
                }
            }

            if (app.Payment.Amount > 0)
                items.Add(new TextOverlayItem { X = 432.0, Y = 753.5, Text = app.Payment.Amount.ToString("N2"), FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(app.Payment.CollectingOfficer))
            {
                double officerX = CenterX(405.0, 535.0, app.Payment.CollectingOfficer, 7.5, false);
                items.Add(new TextOverlayItem { X = officerX, Y = 763.5, Text = app.Payment.CollectingOfficer, FontSize = 7.5 });
            }
        }

        return items;
    }
}
