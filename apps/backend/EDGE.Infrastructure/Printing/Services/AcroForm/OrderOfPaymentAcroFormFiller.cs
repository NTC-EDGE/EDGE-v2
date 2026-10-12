using System;
using System.IO;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using iText.Forms;
using iText.Kernel.Pdf;

namespace EDGE.Infrastructure.Printing.Services.AcroForm;

/// <summary>
/// Fills the official NTC Order of Payment AcroForm PDF template (order-of-payment-template.pdf)
/// directly preserving the authentic Republic of the Philippines seal, NTC logo, official fonts,
/// borders, and pre-printed 2-up layout (Upper and Lower duplicate vouchers).
/// Note: The template's AcroForm fields already bind to both the Upper and Lower 2-up voucher
/// widget annotations simultaneously, ensuring identical and crisp vector rendering across both copies.
/// </summary>
public static class OrderOfPaymentAcroFormFiller
{

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

                // Flatten all AcroForm fields (automatically fills and bakes BOTH Upper and Lower 2-up copies)
                form.FlattenFields();
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
