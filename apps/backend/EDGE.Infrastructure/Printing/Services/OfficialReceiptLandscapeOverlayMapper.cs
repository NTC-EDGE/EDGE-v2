using System;
using System.Collections.Generic;
using System.Globalization;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Fields;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps OfficialReceiptModel data onto the official landscape NTC Official Receipt (Accountable Form No. 51).
/// </summary>
public static class OfficialReceiptLandscapeOverlayMapper
{
    public static IReadOnlyList<FieldOverlay> MapToFieldOverlays(OfficialReceiptModel model)
    {
        var items = new List<FieldOverlay>();

        // 1. Receipt Number & Date
        if (!string.IsNullOrWhiteSpace(model.ReceiptNo))
        {
            items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.Header.ReceiptNumber, model.ReceiptNo));
        }

        if (!string.IsNullOrWhiteSpace(model.Date))
        {
            items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.Header.Date, model.Date));
        }

        // 2. Payor Name
        if (!string.IsNullOrWhiteSpace(model.Payor))
        {
            items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.Payor.Name, model.Payor));
        }

        // 3. Line Items Table (SOA fee types and amounts)
        var lineItems = model.Items ?? new List<OfficialReceiptItem>();
        int maxItems = 8;
        for (int i = 0; i < Math.Min(lineItems.Count, maxItems); i++)
        {
            var item = lineItems[i];
            double y = OfficialReceiptLandscapeFields.DetailsTable.StartY + (i * OfficialReceiptLandscapeFields.DetailsTable.RowHeight);

            var descField = new PdfField(
                $"Item.Desc.{i}",
                X: OfficialReceiptLandscapeFields.DetailsTable.DescriptionX,
                Y: y,
                Width: OfficialReceiptLandscapeFields.DetailsTable.DescriptionWidth,
                FontSize: 9.0);

            var amtField = new PdfField(
                $"Item.Amount.{i}",
                X: OfficialReceiptLandscapeFields.DetailsTable.AmountX,
                Y: y,
                Width: OfficialReceiptLandscapeFields.DetailsTable.AmountWidth,
                FontSize: 9.0,
                HorizontalAlignment: HorizontalAlignment.Right);

            items.Add(new TextFieldOverlay(descField, item.NatureOfCollection));
            string amountStr = item.Amount.HasValue ? item.Amount.Value.ToString("N2", CultureInfo.InvariantCulture) : string.Empty;
            items.Add(new TextFieldOverlay(amtField, amountStr));
        }

        // Total
        if (model.TotalAmount.HasValue && model.TotalAmount.Value > 0)
        {
            items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.DetailsTable.TotalLabel, "TOTAL:"));
            items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.DetailsTable.TotalAmount, $"PHP {model.TotalAmount.Value:N2}"));
        }

        // 4. Amount in Words
        if (!string.IsNullOrWhiteSpace(model.AmountInWords))
        {
            items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.AmountInWords.Text, model.AmountInWords));
        }

        // 5. Payment Mode Checkboxes: Render both square frames [ ] and checkmark inside the selected mode
        bool isCheck = model.SelectedPaymentType == PaymentType.Check || model.SelectedPaymentType == PaymentType.CheckOrPmo;
        items.Add(new CheckboxFieldOverlay(OfficialReceiptLandscapeFields.PaymentMode.CashCheckbox, !isCheck, Style: CheckboxStyle.Checkmark, DrawBox: true));
        items.Add(new CheckboxFieldOverlay(OfficialReceiptLandscapeFields.PaymentMode.CheckCheckbox, isCheck, Style: CheckboxStyle.Checkmark, DrawBox: true));

        if (isCheck)
        {
            if (!string.IsNullOrWhiteSpace(model.TreasuryWarrantCheckMoneyOrderInfo))
            {
                items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.PaymentMode.CheckNumber, model.TreasuryWarrantCheckMoneyOrderInfo));
            }
            if (!string.IsNullOrWhiteSpace(model.DateOfTreasuryWarrantCheckMoneyOrder))
            {
                items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.PaymentMode.CheckDate, model.DateOfTreasuryWarrantCheckMoneyOrder));
            }
        }

        // 6. Collecting Officer
        var officerName = !string.IsNullOrWhiteSpace(model.CollectingOfficer)
            ? model.CollectingOfficer
            : "Authorized Cashier";
        items.Add(new TextFieldOverlay(OfficialReceiptLandscapeFields.Officer.CollectingOfficer, officerName));

        return items;
    }
}
