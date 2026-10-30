using System;
using System.IO;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using iText.Barcodes;
using iText.Forms;
using iText.Forms.Fields;
using iText.Kernel.Colors;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.IO.Image;
using iText.Layout.Element;

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
                                  (model.DocumentType.Equals("Accreditation", StringComparison.OrdinalIgnoreCase) ||
                                   model.DocumentType.Equals("Permit", StringComparison.OrdinalIgnoreCase))
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
                var region = !string.IsNullOrWhiteSpace(model.RegionalOffice) ? model.RegionalOffice : "National Capital Region";
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

                // 12. Vector QR Code Placement
                StampQrCode(pdfDoc, form, model);

                // 13. Applicant Photo Placement (1" x 1")
                StampApplicantPhoto(pdfDoc, form, model);

                // Flatten all form fields to bake values into the statutory template
                form.FlattenFields();
            }
        }

        return outStream.ToArray();
    }

    private static void SetField(PdfAcroForm form, string fieldName, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        var field = form.GetField(fieldName);
        if (field is PdfTextFormField textField)
        {
            textField.SetValue(value);
        }
        else if (field != null && !(field is PdfButtonFormField))
        {
            field.SetValue(value);
        }
    }

    private static void StampQrCode(PdfDocument pdfDoc, PdfAcroForm form, IssuedDocumentModel model)
    {
        if (string.IsNullOrWhiteSpace(model.QrVerificationCode)) return;

        var qrField = form.GetField("QRCode");
        if (qrField == null) return;

        var widgets = qrField.GetWidgets();
        if (widgets == null || widgets.Count == 0) return;

        try
        {
            var widget = widgets[0];
            var page = widget.GetPage();
            if (page == null) page = pdfDoc.GetPage(1);

            var rect = widget.GetRectangle().ToRectangle();
            if (rect.GetWidth() > 5 && rect.GetHeight() > 5)
            {
                var qr = new BarcodeQRCode(model.QrVerificationCode);
                var formXObject = qr.CreateFormXObject(ColorConstants.BLACK, pdfDoc);
                var canvas = new PdfCanvas(page);
                canvas.AddXObjectFittedIntoRectangle(formXObject, rect);
            }
        }
        catch
        {
            // Fail gracefully if widget rectangle is invalid
        }
    }

    private static void StampApplicantPhoto(PdfDocument pdfDoc, PdfAcroForm form, IssuedDocumentModel model)
    {
        if (model.ApplicantPhotoBytes == null || model.ApplicantPhotoBytes.Length == 0) return;

        var photoField = form.GetField("ApplicantPhoto") ?? form.GetField("Photo") ?? form.GetField("Picture");
        iText.Kernel.Geom.Rectangle? rect = null;
        PdfPage page = pdfDoc.GetPage(1);

        if (photoField != null)
        {
            var widgets = photoField.GetWidgets();
            if (widgets != null && widgets.Count > 0)
            {
                var widget = widgets[0];
                if (widget.GetPage() != null) page = widget.GetPage();
                rect = widget.GetRectangle().ToRectangle();
            }
        }

        if (rect == null && model.DocumentType == "Admission Slip")
        {
            // Standard NTC 1-01 Admission Slip photo coordinates (points): X: 541.0, Y: 649.0, W: 63.0, H: 76.0
            rect = new iText.Kernel.Geom.Rectangle(541.0f, 649.0f, 63.0f, 76.0f);
        }

        if (rect != null)
        {
            try
            {
                var imageData = ImageDataFactory.Create(model.ApplicantPhotoBytes);
                var image = new Image(imageData);
                var canvas = new PdfCanvas(page);
                canvas.AddXObjectFittedIntoRectangle(image.GetXObject(), rect);
            }
            catch
            {
                // Graceful fallback if image decoding fails
            }
        }
    }
}
