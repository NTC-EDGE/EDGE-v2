using System;
using System.IO;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using iText.Barcodes;
using iText.Forms;
using iText.Forms.Fields;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.IO.Font.Constants;
using iText.IO.Image;
using SkiaSharp;

namespace EDGE.Infrastructure.Printing.Services.AcroForm;

/// <summary>
/// Fills official NTC statutory document PDF templates (Exam Admission Slip, Accreditation,
/// Radio Operator Certificates, Amateur Licenses, WDN/SRD/RFID Registration Certificates,
/// TVRO Certificates, Certificate of Exemption) directly preserving authentic Republic of the Philippines
/// seals, NTC emblems, security borders, and official accountable typography.
/// </summary>
public static class IssuedDocumentAcroFormFiller
{
    public static byte[] Fill(byte[] templateBytes, IssuedDocumentModel model)
    {
        if (templateBytes == null || templateBytes.Length == 0)
        {
            throw new ArgumentException("Template bytes cannot be null or empty.", nameof(templateBytes));
        }

        model ??= new IssuedDocumentModel();
        var safeDocType = model.DocumentType ?? string.Empty;

        using var inStream = new MemoryStream(templateBytes);
        using var outStream = new MemoryStream();

        using (var reader = new PdfReader(inStream))
        using (var writer = new PdfWriter(outStream))
        using (var pdfDoc = new PdfDocument(reader, writer))
        {
            var form = PdfAcroForm.GetAcroForm(pdfDoc, true);
            if (form != null)
            {
                // 1. Licensee / Grantee / Examinee Information
                var displayName = !string.IsNullOrWhiteSpace(model.CompanyName) &&
                                  (safeDocType.Equals("Accreditation", StringComparison.OrdinalIgnoreCase) ||
                                   safeDocType.Equals("Permit", StringComparison.OrdinalIgnoreCase))
                    ? model.CompanyName
                    : model.LicenseeName;

                SetField(form, "ApplicantName", displayName);
                SetField(form, "ApplicantName.", displayName);
                SetField(form, "ApplicantAddress", model.Address);
                SetField(form, "StationLocation", model.StationLocation ?? model.LocationOrServiceArea ?? model.Address);
                SetField(form, "ContactNumber", model.ContactNumber);
                SetField(form, "FaxNumber", model.FaxNumber);

                // 2. Control, Registration, and Permit Numbers
                var regNo = model.RegistrationNumber ?? model.LicenseNumber ?? model.FormNumber ?? model.ReferenceNumber;
                var permitNo = model.PermitNumber ?? model.LicenseNumber ?? model.FormNumber ?? model.ReferenceNumber;
                SetField(form, "RegistrationNumber", regNo);
                SetField(form, "PermitNumber", permitNo);
                SetField(form, "BSDNumber", model.BSDNumber ?? regNo);

                // 3. Dates & Validity
                var dateStr = model.IssueDate.ToString("MM/dd/yyyy");
                var dateLongStr = model.IssueDate.ToString("MMMM dd, yyyy");
                SetField(form, "DateCreated", dateStr);
                SetField(form, "DateCreated.", dateStr);
                SetField(form, "DateIssued", dateStr);
                SetField(form, "Date", dateStr);

                var expiryStr = model.ExpiryDate?.ToString("MM/dd/yyyy") ?? model.ValidityPeriod ?? string.Empty;
                var expiryLongStr = model.ExpiryDate?.ToString("MMMM dd, yyyy") ?? model.ValidityPeriod ?? "THREE (3) YEARS";
                SetField(form, "ValidUntil", expiryStr);
                SetField(form, "Validity", expiryLongStr);
                SetField(form, "DateFrom", dateStr);
                SetField(form, "DateTo", expiryStr);

                // 4. Station & Call Sign Classifications
                SetField(form, "CallSign", model.CallSign);
                SetField(form, "Class", model.StationClass ?? model.Category);
                SetField(form, "Category", model.Category ?? model.StationClass);

                // 5. Equipment Specifications (Certificates, Permits, WDN/SRD/RFID)
                SetField(form, "MakeTypeModel", model.MakeTypeModel ?? model.EquipmentDetails);
                SetField(form, "SerialNumber", model.SerialNumber);
                SetField(form, "Quantity", model.Quantity ?? "1");
                SetField(form, "NumberOfUnits", model.NumberOfUnits ?? model.Quantity ?? "1");
                SetField(form, "OtherEquipment", model.OtherEquipment ?? model.FrequencyBand);
                SetField(form, "AuthorizedEquipment", model.AuthorizedEquipment ?? model.EquipmentDetails);
                SetField(form, "FrequencyRange", model.FrequencyRange ?? model.FrequencyBand);
                SetField(form, "PowerOutput", model.PowerOutput);

                // 6. TVRO Specific Parameters
                SetField(form, "Diameter", model.Diameter);
                SetField(form, "Polarization", model.Polarization);
                SetField(form, "AzimuthAndAngleOfElevation", model.AzimuthAndAngleOfElevation);
                SetField(form, "TypeModelDish", model.TypeModelDish ?? model.MakeTypeModel);
                SetField(form, "LNALNBMakeTypeModel", model.LNALNBMakeTypeModel ?? model.MakeTypeModel);
                SetField(form, "LNALNBRange", model.LNALNBRange ?? model.FrequencyRange);
                SetField(form, "LNALNBSerialNumber", model.LNALNBSerialNumber ?? model.SerialNumber);

                // 7. Examination Details (Service 1 Admission Slip & Service 2 ROC)
                SetField(form, "Exam", model.Exam ?? model.ServiceName);
                SetField(form, "ExamDate", model.ExamDate ?? dateStr);
                SetField(form, "ExamTime", model.ExamTime ?? "08:00 AM");
                SetField(form, "ExamVenue", model.ExamVenue ?? "NTC Regional Office / Examination Hall");
                SetField(form, "ExamRating", model.ExamRating);
                SetField(form, "Elements", model.ExamElements ?? "Elements 1, 2, 3, 4");
                SetField(form, "Others", model.Others);

                // 8. Personal Details (ROC, Amateur)
                SetField(form, "Citizenship", model.Citizenship ?? "Filipino");
                SetField(form, "BirthDate", model.BirthDate);
                SetField(form, "Sex", model.Sex);
                SetField(form, "Height", model.Height);
                SetField(form, "Weight", model.Weight);

                // 9. Signatories & Regional Office
                var region = !string.IsNullOrWhiteSpace(model.RegionalOffice) ? model.RegionalOffice : string.Empty;
                SetField(form, "Region", region);
                SetField(form, "Region.", region);

                var director = !string.IsNullOrWhiteSpace(model.SignatoryName) ? model.SignatoryName : "REGIONAL DIRECTOR";
                SetField(form, "Director", director);
                SetField(form, "Director.", director);
                SetField(form, "Commissioner", model.CommissionerName ?? "COMMISSIONER");

                var evaluator = !string.IsNullOrWhiteSpace(model.EvaluatorName) ? model.EvaluatorName : (model.OriginalEvaluatorName ?? "Licensing Officer");
                SetField(form, "Evaluator", evaluator);
                SetField(form, "EvaluatorLabel", model.EvaluatorLabel ?? "Evaluated and Certified By:");
                SetField(form, "ProcessByEvaluation", model.ProcessByEvaluation ?? evaluator);

                // 10. Remarks and Notes
                SetField(form, "Notes", model.Notes ?? model.Remarks);
                SetField(form, "Note", model.Notes ?? model.Remarks);
                SetField(form, "Remarks", model.Remarks);

                // 11. Official Receipt Cross-Reference
                var amountVal = model.OrAmount ?? (model.AmountPaid.HasValue ? model.AmountPaid.Value.ToString("N2") : string.Empty);
                var totalFeeVal = model.OrAmount ?? (model.AmountPaid.HasValue ? $"PHP {model.AmountPaid.Value:N2}" : string.Empty);
                SetField(form, "ORNumber", model.OfficialReceiptNumber);
                SetField(form, "ORAmount", amountVal);
                SetField(form, "TotalFee", totalFeeVal);
                SetField(form, "ORDate", model.OrDate ?? dateStr);
                SetField(form, "ORBy", model.OrBy ?? "Special Collecting Officer");

                // 12. Extract coordinates for QR Code and 1x1 Photo before flattening button widgets
                var (qrPage, qrRect) = ExtractWidgetLocation(pdfDoc, form, "QRCode");
                var (photoPage, photoRect) = ExtractWidgetLocation(pdfDoc, form, "ApplicantPhoto", "Photo", "Picture");

                // Remove button placeholder widgets so FlattenFields does not paint opaque white backgrounds or placeholder icons over the header
                RemoveButtonPlaceholders(form, "QRCode", "ApplicantPhoto", "Photo", "Picture", "DirectorSignature", "EvaluatorSignature", "CommissionerSignature", "Signature");

                // Flatten all form fields to bake values into the statutory template
                form.FlattenFields();

                // 13. Stamp Vector QR Code on top layer after flattening
                StampQrCode(pdfDoc, qrPage, qrRect, model);

                // 14. Stamp Applicant 1" x 1" Photo (or clean 1x1 frame) on top layer after flattening
                StampApplicantPhoto(pdfDoc, photoPage, photoRect, model);
            }
        }

        return outStream.ToArray();
    }

    private static void SetField(PdfAcroForm form, string fieldName, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        var field = form.GetField(fieldName);
        if (field == null) return;
        try
        {
            if (field is PdfTextFormField textField)
            {
                textField.SetValue(value);
            }
            else if (!(field is PdfButtonFormField))
            {
                field.SetValue(value);
            }
        }
        catch
        {
            // Ignore individual AcroForm field errors so the rest of the issued document still renders
        }
    }

    private static (PdfPage Page, iText.Kernel.Geom.Rectangle? Rect) ExtractWidgetLocation(
        PdfDocument pdfDoc,
        PdfAcroForm form,
        params string[] fieldNames)
    {
        PdfPage fallbackPage = pdfDoc.GetPage(1);
        foreach (var name in fieldNames)
        {
            var field = form.GetField(name);
            if (field == null) continue;

            var widgets = field.GetWidgets();
            if (widgets != null && widgets.Count > 0)
            {
                var widget = widgets[0];
                var page = widget.GetPage() ?? fallbackPage;
                var rect = widget.GetRectangle()?.ToRectangle();
                if (rect != null && rect.GetWidth() > 5 && rect.GetHeight() > 5)
                {
                    return (page, rect);
                }
            }
        }

        return (fallbackPage, null);
    }

    private static void RemoveButtonPlaceholders(PdfAcroForm form, params string[] fieldNames)
    {
        foreach (var name in fieldNames)
        {
            try
            {
                if (form.GetField(name) != null)
                {
                    form.RemoveField(name);
                }
            }
            catch
            {
                // Ignore if field cannot be removed
            }
        }
    }

    private static void StampQrCode(
        PdfDocument pdfDoc,
        PdfPage page,
        iText.Kernel.Geom.Rectangle? rect,
        IssuedDocumentModel model)
    {
        if (rect == null && string.Equals(model.DocumentType, "Admission Slip", StringComparison.OrdinalIgnoreCase))
        {
            // Standard Service-1-Admission-Slip.pdf top-right header QR box coordinates
            rect = new iText.Kernel.Geom.Rectangle(697.998f, 471.851f, 107.687f, 102.519f);
        }

        if (rect == null || rect.GetWidth() <= 5 || rect.GetHeight() <= 5) return;

        var qrValue = !string.IsNullOrWhiteSpace(model.QrVerificationCode)
            ? model.QrVerificationCode.Trim()
            : $"NTC-VERIFY-{model.FormNumber ?? model.LicenseNumber ?? model.ReferenceNumber ?? "OFFICIAL"}";

        try
        {
            var canvas = new PdfCanvas(page.NewContentStreamAfter(), page.GetResources(), pdfDoc);
            canvas.SaveState();

            // Clean white background + subtle frame border so underlying placeholder never bleeds through
            canvas.SetFillColor(ColorConstants.WHITE);
            canvas.SetStrokeColor(new DeviceRgb(148, 163, 184));
            canvas.SetLineWidth(0.75f);
            canvas.Rectangle(rect);
            canvas.FillStroke();

            var qr = new BarcodeQRCode(qrValue);
            var formXObject = qr.CreateFormXObject(ColorConstants.BLACK, pdfDoc);

            const float pad = 3.0f;
            var innerRect = new iText.Kernel.Geom.Rectangle(
                rect.GetX() + pad,
                rect.GetY() + pad,
                Math.Max(10f, rect.GetWidth() - (pad * 2f)),
                Math.Max(10f, rect.GetHeight() - (pad * 2f)));

            canvas.AddXObjectFittedIntoRectangle(formXObject, innerRect);
            canvas.RestoreState();
        }
        catch
        {
            // Fail gracefully if QR rendering fails
        }
    }

    private static void StampApplicantPhoto(
        PdfDocument pdfDoc,
        PdfPage page,
        iText.Kernel.Geom.Rectangle? rect,
        IssuedDocumentModel model)
    {
        if (rect == null && string.Equals(model.DocumentType, "Admission Slip", StringComparison.OrdinalIgnoreCase))
        {
            // Standard Service-1-Admission-Slip.pdf top-left header 1x1 Photo box coordinates
            rect = new iText.Kernel.Geom.Rectangle(43.328f, 473.966f, 104.606f, 100.988f);
        }

        if (rect == null || rect.GetWidth() <= 5 || rect.GetHeight() <= 5) return;

        try
        {
            var canvas = new PdfCanvas(page.NewContentStreamAfter(), page.GetResources(), pdfDoc);
            canvas.SaveState();

            // Clean white background + border frame for the 1x1 photo box
            canvas.SetFillColor(ColorConstants.WHITE);
            canvas.SetStrokeColor(new DeviceRgb(148, 163, 184));
            canvas.SetLineWidth(0.75f);
            canvas.Rectangle(rect);
            canvas.FillStroke();

            bool imageDrawn = false;
            if (model.ApplicantPhotoBytes != null && model.ApplicantPhotoBytes.Length > 0)
            {
                try
                {
                    var imageData = CreateImageDataWithFallback(model.ApplicantPhotoBytes);
                    if (imageData != null)
                    {
                        const float pad = 1.5f;
                        var innerRect = new iText.Kernel.Geom.Rectangle(
                            rect.GetX() + pad,
                            rect.GetY() + pad,
                            Math.Max(10f, rect.GetWidth() - (pad * 2f)),
                            Math.Max(10f, rect.GetHeight() - (pad * 2f)));

                        canvas.AddImageFittedIntoRectangle(imageData, innerRect, false);
                        imageDrawn = true;
                    }
                }
                catch
                {
                    imageDrawn = false;
                }
            }

            if (!imageDrawn)
            {
                // Draw a clean 1" x 1" ID Picture frame with silhouette and label when no photo bytes are uploaded yet
                float cx = rect.GetX() + (rect.GetWidth() / 2f);
                float cy = rect.GetY() + (rect.GetHeight() / 2f);
                float headRadius = Math.Min(rect.GetWidth(), rect.GetHeight()) * 0.14f;

                canvas.SetStrokeColor(new DeviceRgb(148, 163, 184));
                canvas.SetFillColor(new DeviceRgb(241, 245, 249));
                canvas.SetLineWidth(1.0f);

                // Head circle
                canvas.Circle(cx, cy + (headRadius * 0.9f), headRadius);
                canvas.FillStroke();

                // Shoulders / bust rounded shape
                float bustW = headRadius * 3.1f;
                float bustH = headRadius * 1.6f;
                canvas.RoundRectangle(cx - (bustW / 2f), cy - (headRadius * 1.45f), bustW, bustH, headRadius * 0.65f);
                canvas.FillStroke();

                // "1x1 ID PHOTO" label at bottom of the box
                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
                string label = "1x1 ID PHOTO";
                float fontSize = 7.5f;
                float textWidth = font.GetWidth(label, fontSize);
                canvas.BeginText();
                canvas.SetFontAndSize(font, fontSize);
                canvas.SetFillColor(new DeviceRgb(100, 116, 139));
                canvas.MoveText(cx - (textWidth / 2f), rect.GetY() + 8f);
                canvas.ShowText(label);
                canvas.EndText();
            }

            canvas.RestoreState();
        }
        catch
        {
            // Graceful fallback
        }
    }

    private static ImageData? CreateImageDataWithFallback(byte[] rawBytes)
    {
        try
        {
            return ImageDataFactory.Create(rawBytes);
        }
        catch
        {
            // Fallback for WebP or other formats not natively supported by iText ImageDataFactory
            try
            {
                using var bitmap = SKBitmap.Decode(rawBytes);
                if (bitmap != null)
                {
                    using var image = SKImage.FromBitmap(bitmap);
                    using var encoded = image.Encode(SKEncodedImageFormat.Png, 100);
                    if (encoded != null)
                    {
                        return ImageDataFactory.Create(encoded.ToArray());
                    }
                }
            }
            catch
            {
                // Ignore if SkiaSharp also cannot decode
            }
            return null;
        }
    }
}
