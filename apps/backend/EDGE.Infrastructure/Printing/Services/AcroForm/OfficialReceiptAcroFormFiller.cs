using System;
using System.IO;
using EDGE.Infrastructure.Printing.Models;
using iText.Forms;
using iText.Kernel.Pdf;

namespace EDGE.Infrastructure.Printing.Services.AcroForm;

/// <summary>
/// Fills the official NTC Official Receipt (Accountable Form No. 51) AcroForm PDF template (or_portrait-template.pdf)
/// directly preserving the authentic Republic of the Philippines seal, NTC logo, official typography,
/// and security paper markings.
/// </summary>
public static class OfficialReceiptAcroFormFiller
{
    public static byte[] Fill(byte[] templateBytes, OfficialReceiptModel model)
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
                SetField(form, "ORNumber", model.ReceiptNo);
                SetField(form, "DateCreated", model.Date);
                SetField(form, "ApplicantName", model.Payor);

                string amountStr = model.TotalAmount.HasValue && model.TotalAmount.Value > 0 ? model.TotalAmount.Value.ToString("N2") : string.Empty;
                SetField(form, "Amount", amountStr);
                SetField(form, "Total", amountStr);
                SetField(form, "AmountInWords", model.AmountInWords);

                var details = string.Join("; ", model.Items.Select(i => i.Amount.HasValue && i.Amount.Value > 0 ? $"{i.NatureOfCollection}: ₱{i.Amount.Value:N2}" : i.NatureOfCollection).Where(s => !string.IsNullOrWhiteSpace(s)));
                SetField(form, "DetailsOfPayment", !string.IsNullOrWhiteSpace(details) ? details : "Assessment & Regulatory Fees");
                SetField(form, "Cashier", model.CollectingOfficer ?? "Collecting Officer");

                // Payment mode checkboxes (CheckBox0: Cash, CheckBox1: Check)
                if (model.SelectedPaymentType == PaymentType.Cash)
                {
                    form.GetField("CheckBox0")?.SetValue("Yes");
                }
                else if (model.SelectedPaymentType == PaymentType.Check || model.SelectedPaymentType == PaymentType.CheckOrPmo)
                {
                    form.GetField("CheckBox1")?.SetValue("Yes");
                    SetField(form, "CheckDate", model.DateOfTreasuryWarrantCheckMoneyOrder);
                }

                // Flatten all fields to bake into the official government document
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
