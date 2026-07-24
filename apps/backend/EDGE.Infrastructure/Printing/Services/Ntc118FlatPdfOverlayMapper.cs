using System;
using System.Collections.Generic;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

public static class Ntc118FlatPdfOverlayMapper
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

    public static List<TextOverlayItem> MapToOverlayItems(Ntc118Application app)
    {
        var items = new List<TextOverlayItem>();

        // 1. TYPE OF APPLICATION
        switch (app.TypeOfApplication)
        {
            case TypeOfApplication118.New:
                items.Add(new TextOverlayItem { X = 87.3, Y = 249.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case TypeOfApplication118.Renewal:
                items.Add(new TextOverlayItem { X = 87.3, Y = 264.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case TypeOfApplication118.Modification:
                items.Add(new TextOverlayItem { X = 87.3, Y = 279.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                if (!string.IsNullOrWhiteSpace(app.ModificationReason))
                {
                    items.Add(new TextOverlayItem { X = 101.0, Y = 299.8, Text = app.ModificationReason, FontSize = 7.5 });
                }
                break;
        }

        // PERMIT CATEGORY SELECTION
        var pc = app.PermitCategory;
        if (pc != null)
        {
            // Radio Communications Equipment (RCE)
            if (pc.RceCategory) items.Add(new TextOverlayItem { X = 295.4, Y = 249.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.RceDealer) items.Add(new TextOverlayItem { X = 318.4, Y = 264.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.RceDealerTransceiver) items.Add(new TextOverlayItem { X = 341.4, Y = 279.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.RceDealerWdnIndoorSrdRfid) items.Add(new TextOverlayItem { X = 341.4, Y = 294.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.RceManufacturer) items.Add(new TextOverlayItem { X = 318.4, Y = 309.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.RceServiceCenter) items.Add(new TextOverlayItem { X = 318.4, Y = 324.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });

            // Mobile Phone
            if (pc.MobilePhoneCategory) items.Add(new TextOverlayItem { X = 295.4, Y = 339.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.MpDealer) items.Add(new TextOverlayItem { X = 318.4, Y = 354.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.MpRetailerReseller) items.Add(new TextOverlayItem { X = 318.4, Y = 369.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
            if (pc.MpServiceCenter) items.Add(new TextOverlayItem { X = 318.4, Y = 384.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });

            // CPE Supplier Accreditation
            if (pc.CpeSupplierAccreditation) items.Add(new TextOverlayItem { X = 295.4, Y = 399.4, Text = CheckmarkChar, FontSize = 10, IsBold = true });
        }

        // 2. APPLICANT'S DETAILS
        if (!string.IsNullOrWhiteSpace(app.Applicant.Name))
            items.Add(new TextOverlayItem { X = 123.0, Y = 440.0, Text = app.Applicant.Name, FontSize = 8, IsBold = true });

        // Entity Type
        switch (app.EntityType)
        {
            case EntityType118.Corporation:
                items.Add(new TextOverlayItem { X = 185.0, Y = 467.2, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case EntityType118.SingleProprietorship:
                items.Add(new TextOverlayItem { X = 185.0, Y = 482.2, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case EntityType118.Partnership:
                items.Add(new TextOverlayItem { X = 392.0, Y = 467.2, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                break;
            case EntityType118.Others:
                items.Add(new TextOverlayItem { X = 392.0, Y = 482.2, Text = CheckmarkChar, FontSize = 10, IsBold = true });
                if (!string.IsNullOrWhiteSpace(app.EntityTypeOther))
                {
                    items.Add(new TextOverlayItem { X = 402.0, Y = 485.0, Text = app.EntityTypeOther, FontSize = 7.5 });
                }
                break;
        }

        if (!string.IsNullOrWhiteSpace(app.ExistingPermitNo))
            items.Add(new TextOverlayItem { X = 123.0, Y = 500.0, Text = app.ExistingPermitNo, FontSize = 7.5 });

        if (app.ExistingPermitValidity != default)
            items.Add(new TextOverlayItem { X = 402.0, Y = 500.0, Text = app.ExistingPermitValidity.ToString("MM/dd/yy"), FontSize = 7.5 });

        var addr = app.Applicant.Address;
        if (addr != null)
        {
            if (!string.IsNullOrWhiteSpace(addr.UnitRoomBldgNo))
                items.Add(new TextOverlayItem { X = 123.0, Y = 515.0, Text = addr.UnitRoomBldgNo, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.Street))
                items.Add(new TextOverlayItem { X = 380.0, Y = 515.0, Text = addr.Street, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.Barangay))
                items.Add(new TextOverlayItem { X = 123.0, Y = 530.0, Text = addr.Barangay, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.CityMunicipality))
                items.Add(new TextOverlayItem { X = 380.0, Y = 530.0, Text = addr.CityMunicipality, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.Province))
                items.Add(new TextOverlayItem { X = 123.0, Y = 545.0, Text = addr.Province, FontSize = 7.5 });

            if (!string.IsNullOrWhiteSpace(addr.ZipCode))
                items.Add(new TextOverlayItem { X = 380.0, Y = 545.0, Text = addr.ZipCode, FontSize = 7.5 });
        }

        if (!string.IsNullOrWhiteSpace(app.Applicant.ContactNumber))
            items.Add(new TextOverlayItem { X = 123.0, Y = 560.0, Text = app.Applicant.ContactNumber, FontSize = 7.5 });

        if (!string.IsNullOrWhiteSpace(app.Applicant.Email))
            items.Add(new TextOverlayItem { X = 380.0, Y = 560.0, Text = app.Applicant.Email, FontSize = 7.5 });

        // 3. PERSONNEL REQUIRED
        if (app.SupervisingEngineer != null)
        {
            if (!string.IsNullOrWhiteSpace(app.SupervisingEngineer.Name))
                items.Add(new TextOverlayItem { X = 123.0, Y = 605.0, Text = app.SupervisingEngineer.Name, FontSize = 7.5 });
            if (!string.IsNullOrWhiteSpace(app.SupervisingEngineer.LicenseNo))
                items.Add(new TextOverlayItem { X = 123.0, Y = 620.0, Text = app.SupervisingEngineer.LicenseNo, FontSize = 7.5 });
            if (app.SupervisingEngineer.ValidityDate != default)
                items.Add(new TextOverlayItem { X = 123.0, Y = 636.0, Text = app.SupervisingEngineer.ValidityDate.ToString("MM/dd/yy"), FontSize = 7.5 });
        }

        if (app.Technician != null)
        {
            if (!string.IsNullOrWhiteSpace(app.Technician.Name))
                items.Add(new TextOverlayItem { X = 423.0, Y = 605.0, Text = app.Technician.Name, FontSize = 7.5 });
            if (!string.IsNullOrWhiteSpace(app.Technician.LicenseNo))
                items.Add(new TextOverlayItem { X = 423.0, Y = 620.0, Text = app.Technician.LicenseNo, FontSize = 7.5 });
            if (app.Technician.ValidityDate != default)
                items.Add(new TextOverlayItem { X = 423.0, Y = 636.0, Text = app.Technician.ValidityDate.ToString("MM/dd/yy"), FontSize = 7.5 });
        }

        // 4. DECLARATION & SIGNATURE
        if (!string.IsNullOrWhiteSpace(app.Declaration.SignatoryName))
        {
            double sigX = CenterX(76.8, 306.9, app.Declaration.SignatoryName, 8, true);
            items.Add(new TextOverlayItem { X = sigX, Y = 723.8, Text = app.Declaration.SignatoryName, FontSize = 8, IsBold = true });
        }

        if (app.Declaration.DateAccomplished != default)
        {
            string dateStr = app.Declaration.DateAccomplished.ToString("MM/dd/yyyy");
            double dateX = CenterX(76.8, 306.9, dateStr, 8, false);
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
