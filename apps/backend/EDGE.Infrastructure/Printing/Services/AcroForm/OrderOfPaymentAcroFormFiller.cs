using System;
using System.IO;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using iText.Forms;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;

namespace EDGE.Infrastructure.Printing.Services.AcroForm;

/// <summary>
/// Fills the official NTC Order of Payment AcroForm PDF template (order-of-payment-template.pdf)
/// directly preserving the authentic Republic of the Philippines seal, NTC logo, official fonts,
/// borders, and pre-printed 2-up layout (Upper and Lower duplicate vouchers).
/// </summary>
public static class OrderOfPaymentAcroFormFiller
{
    private const float LowerCopyDeltaY = 255.6f;

    public static byte[] Fill(byte[] templateBytes, OrderOfPaymentModel model)
    {
        if (templateBytes == null || templateBytes.Length == 0)
        {
            throw new ArgumentException("Template bytes cannot be null or empty.", nameof(templateBytes));
        }

        using var inStream = new MemoryStream(templateBytes);
        using var outStream = new MemoryStream();

        using (var reader = new PdfReader(inStream))
        using (var writer = new PdfWriter(outStream))
        using (var pdfDoc = new PdfDocument(reader, writer))
        {
            var form = PdfAcroForm.GetAcroForm(pdfDoc, true);
            if (form != null)
            {
                // Top Copy (AcroForm fields)
                SetField(form, "SerialNo", model.SerialNo);
                SetField(form, "Date", model.Date);
                SetField(form, "Region", model.RegionalOffice);
                SetField(form, "ApplicantName", model.PayorName);
                SetField(form, "ApplicantAddress", model.PayorAddress);
                SetField(form, "SOANumber", model.StatementOfAccountNo);
                SetField(form, "Dated", model.StatementOfAccountDate);
                SetField(form, "Purpose", model.Purpose);
                SetField(form, "AmountInWords", model.AmountInWords);

                string amountStr = model.Amount.HasValue && model.Amount.Value > 0
                    ? model.Amount.Value.ToString("N2")
                    : (model.TotalAmount.HasValue && model.TotalAmount.Value > 0 ? model.TotalAmount.Value.ToString("N2") : string.Empty);
                SetField(form, "Amount", amountStr);
                SetField(form, "TotalAmount", amountStr);

                // Bank details
                var primaryBank = model.BankAccounts?.FirstOrDefault();
                string bankName = primaryBank?.BankName ?? "Land Bank of the Philippines";
                string bankNum = primaryBank?.No ?? "LBP-General";
                string bankAmt = primaryBank?.Amount.HasValue == true && primaryBank.Amount.Value > 0 ? primaryBank.Amount.Value.ToString("N2") : amountStr;

                SetField(form, "Bank", bankName);
                SetField(form, "BankNumber", bankNum);
                SetField(form, "AmountBank", bankAmt);

                // Official Receipt stamp section if paid
                if (!string.IsNullOrWhiteSpace(model.OrNo))
                {
                    SetField(form, "ORNumber", model.OrNo);
                    SetField(form, "ORAmount", model.OrAmount);
                    SetField(form, "ORDate", model.OrDate);
                    SetField(form, "ORBy", model.OrBy);
                }

                SetField(form, "Accountant", model.CollectingOfficer ?? "Special Collecting Officer");
                SetField(form, "AccountantPosition", "Special Collecting Officer");

                // Flatten all AcroForm fields on the upper copy
                form.FlattenFields();
            }

            // Populate the Bottom Copy (Duplicate 2-up voucher)
            // On the physical NTC template, the lower copy is an exact identical duplicate
            // shifted down by 255.6 points.
            var page = pdfDoc.GetFirstPage();
            var canvas = new PdfCanvas(page);
            using var layout = new Canvas(canvas, page.GetPageSize());

            void DrawText(string? text, float x, float y, float fontSize = 8.5f, bool bold = false)
            {
                if (string.IsNullOrWhiteSpace(text)) return;
                var p = new Paragraph(text).SetFontSize(fontSize);
                if (bold) p.SetBold();
                layout.ShowTextAligned(p, x, y, TextAlignment.LEFT);
            }

            // Bottom Copy fields
            DrawText(model.SerialNo, 332.0f, 578.4f - LowerCopyDeltaY, 8f, bold: true);
            DrawText(model.Date, 332.4f, 570.0f - LowerCopyDeltaY, 8f);
            DrawText(model.RegionalOffice, 163.1f, 568.7f - LowerCopyDeltaY, 8f);
            DrawText(model.PayorName, 149.4f, 504.9f - LowerCopyDeltaY, 8.5f, bold: true);
            DrawText(model.PayorAddress, 7.8f, 486.5f - LowerCopyDeltaY, 8f);

            string btmAmountStr = model.Amount.HasValue && model.Amount.Value > 0
                ? model.Amount.Value.ToString("N2")
                : (model.TotalAmount.HasValue && model.TotalAmount.Value > 0 ? model.TotalAmount.Value.ToString("N2") : string.Empty);

            DrawText(model.AmountInWords, 60.1f, 469.5f - LowerCopyDeltaY, 8f);
            DrawText(btmAmountStr, 355.5f, 470.1f - LowerCopyDeltaY, 8f, bold: true);
            DrawText(model.Purpose, 60.5f, 461.4f - LowerCopyDeltaY, 8f);
            DrawText(model.StatementOfAccountNo, 89.7f, 435.8f - LowerCopyDeltaY, 8f, bold: true);
            DrawText(model.StatementOfAccountDate, 298.2f, 436.3f - LowerCopyDeltaY, 8f);

            var btmBank = model.BankAccounts?.FirstOrDefault();
            DrawText(btmBank?.No ?? "LBP-General", 9.6f, 400.8f - LowerCopyDeltaY, 8f);
            DrawText(btmBank?.BankName ?? "Land Bank of the Philippines", 149.6f, 401.2f - LowerCopyDeltaY, 8f);
            DrawText(btmAmountStr, 297.9f, 401.1f - LowerCopyDeltaY, 8f);
            DrawText(btmAmountStr, 297.2f, 383.1f - LowerCopyDeltaY, 8.5f, bold: true);

            DrawText(model.CollectingOfficer ?? "Special Collecting Officer", 103.7f, 356.4f - LowerCopyDeltaY, 8.5f, bold: true);
            DrawText("Special Collecting Officer", 103.5f, 347.6f - LowerCopyDeltaY, 7.5f);

            if (!string.IsNullOrWhiteSpace(model.OrNo))
            {
                DrawText(model.OrNo, 44.5f, 375.0f - LowerCopyDeltaY, 7.5f, bold: true);
                DrawText(model.OrAmount, 45.0f, 361.7f - LowerCopyDeltaY, 7.5f);
                DrawText(model.OrDate, 45.0f, 355.7f - LowerCopyDeltaY, 7.5f);
                DrawText(model.OrBy, 44.2f, 349.8f - LowerCopyDeltaY, 7.5f);
            }
        }

        return outStream.ToArray();
    }

    private static void SetField(PdfAcroForm form, string fieldName, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        var field = form.GetField(fieldName);
        if (field != null)
        {
            field.SetValue(value);
        }
    }
}
