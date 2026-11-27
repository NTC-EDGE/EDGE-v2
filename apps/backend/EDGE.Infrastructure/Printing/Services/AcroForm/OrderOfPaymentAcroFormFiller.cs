using System;
using System.IO;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using iText.Forms;
using iText.IO.Image;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;

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
                // Regional Office - normalize so "Regional Office No. VII" or "VII" formats cleanly, or stays blank
                var regionFieldVal = string.IsNullOrWhiteSpace(model.RegionalOffice)
                    ? null
                    : (model.RegionalOffice.StartsWith("Regional Office", StringComparison.OrdinalIgnoreCase)
                        ? model.RegionalOffice.Replace("Regional Office No.", "", StringComparison.OrdinalIgnoreCase)
                                              .Replace("Regional Office", "", StringComparison.OrdinalIgnoreCase)
                                              .Trim()
                        : model.RegionalOffice.Trim());
                SetField(form, "Region", regionFieldVal);
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

                // Bank details - populate only if bank accounts are provided; otherwise remain blank
                var primaryBank = model.BankAccounts?.FirstOrDefault(b => !string.IsNullOrWhiteSpace(b.BankName));
                if (primaryBank != null)
                {
                    string bankAmt = primaryBank.Amount.HasValue && primaryBank.Amount.Value > 0
                        ? primaryBank.Amount.Value.ToString("N2")
                        : amountStr;

                    SetField(form, "Bank", primaryBank.BankName);
                    SetField(form, "BankNumber", primaryBank.No);
                    SetField(form, "AmountBank", bankAmt);
                }

                if (model.TotalAmount.HasValue && model.TotalAmount.Value > 0)
                {
                    SetField(form, "TotalAmount", model.TotalAmount.Value.ToString("N2"));
                }

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

                // Remove empty signature button placeholders so flattening does not paint opaque grey boxes over the signature area
                try { form.RemoveField("AccountantSignature"); } catch { }
                try { form.RemoveField("Accountant2Signature"); } catch { }

                // Flatten all AcroForm fields (automatically fills and bakes BOTH Upper and Lower 2-up copies)
                form.FlattenFields();

                // Stamp the official NTC Seal onto both Upper and Lower 2-up voucher headers
                StampNtcSeals(pdfDoc);
            }
        }

        return outStream.ToArray();
    }

    private static void StampNtcSeals(PdfDocument pdfDoc)
    {
        try
        {
            if (pdfDoc.GetNumberOfPages() < 1) return;
            var sealBytes = LoadNtcSealBytes();
            if (sealBytes == null || sealBytes.Length == 0) return;

            var page = pdfDoc.GetPage(1);
            var imageData = ImageDataFactory.Create(sealBytes);
            var canvas = new PdfCanvas(page.NewContentStreamAfter(), page.GetResources(), pdfDoc);

            // order-of-payment-template.pdf is A5 Portrait (419.528 x 595.276 pt), 2-up layout.
            // Top-left header seal region on each copy sits cleanly left of
            // "NATIONAL TELECOMMUNICATIONS COMMISSION / Regional Office No." (X ~ 59.3),
            // inside the outer top border (Upper Y ~ 588.5, Lower Y ~ 329.5),
            // and directly above "General Fund" (Upper Y ~ 555.3, Lower Y ~ 299.7).
            const float sealSize = 23.0f;
            const float sealX = 22.0f;

            var upperRect = new Rectangle(sealX, 563.0f, sealSize, sealSize);
            var lowerRect = new Rectangle(sealX + 0.4f, 304.5f, sealSize, sealSize);

            canvas.SaveState();
            canvas.AddImageFittedIntoRectangle(imageData, upperRect, false);
            canvas.AddImageFittedIntoRectangle(imageData, lowerRect, false);
            canvas.RestoreState();
        }
        catch
        {
            // Never fail OP PDF generation if the seal asset cannot be stamped
        }
    }

    internal static byte[]? LoadNtcSealBytes()
    {
        var candidateFileNames = new[] { "ntc-Logo.png", "ntc-logo.png" };
        var searchRoots = new[]
        {
            AppDomain.CurrentDomain.BaseDirectory,
            Directory.GetCurrentDirectory()
        };

        foreach (var root in searchRoots)
        {
            if (string.IsNullOrWhiteSpace(root)) continue;
            var dir = new DirectoryInfo(root);
            while (dir != null)
            {
                foreach (var name in candidateFileNames)
                {
                    var direct = System.IO.Path.Combine(dir.FullName, "Printing", "Assets", "Logos", name);
                    if (File.Exists(direct)) return File.ReadAllBytes(direct);

                    var infra = System.IO.Path.Combine(dir.FullName, "apps", "backend", "EDGE.Infrastructure", "Printing", "Assets", "Logos", name);
                    if (File.Exists(infra)) return File.ReadAllBytes(infra);
                }
                dir = dir.Parent;
            }
        }

        var asm = typeof(OrderOfPaymentAcroFormFiller).Assembly;
        var resourceName = asm.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("ntc-Logo.png", StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(resourceName))
        {
            using var stream = asm.GetManifestResourceStream(resourceName);
            if (stream != null)
            {
                using var ms = new MemoryStream();
                stream.CopyTo(ms);
                return ms.ToArray();
            }
        }

        return null;
    }

    private static void SetField(PdfAcroForm form, string fieldName, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        var field = form.GetField(fieldName);
        if (field != null)
        {
            try
            {
                field.SetValue(value);
            }
            catch
            {
                // Ignore individual field errors so the rest of the OP still renders
            }
        }
    }
}
