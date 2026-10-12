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
/// Fills the official NTC Statement of Account AcroForm PDF template (soa-report-template.pdf)
/// directly preserving the authentic Republic of the Philippines seal, NTC logo, official typography,
/// and pre-printed accountable form grid layout.
/// </summary>
public static class StatementOfAccountAcroFormFiller
{
    public static byte[] Fill(byte[] templateBytes, StatementOfAccountModel model)
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
                // 1. Header Information
                SetField(form, "RCNo", model.AccountNo);
                SetField(form, "Name", model.PayorName);
                SetField(form, "Date", model.Date);
                SetField(form, "Particular1", model.Particular1Header ?? model.AccountNo);
                SetField(form, "NoYears1", model.Particular1PeriodCovered);

                // 2. Transaction Checkboxes
                SetCheckbox(form, "New", model.IsNew);
                SetCheckbox(form, "Mod", model.IsMod);
                SetCheckbox(form, "Co", model.IsCo);
                SetCheckbox(form, "Ma", model.IsMa);
                SetCheckbox(form, "Ren", model.IsRen);
                SetCheckbox(form, "Dup", model.IsDup);
                SetCheckbox(form, "Cv", model.IsCv);
                SetCheckbox(form, "Roc", model.IsRoc);
                SetCheckbox(form, "Ms", model.IsMs);
                SetCheckbox(form, "Other1", model.IsOthersRroca);
                SetCheckbox(form, "Other2", model.IsOthers);

                if (!string.IsNullOrWhiteSpace(model.OthersText))
                {
                    SetField(form, "OtherText", model.OthersText);
                    SetField(form, "Other1Text", model.OthersText);
                    SetField(form, "Other2Text", model.OthersText);
                }

                // 3. Assessment / Endorsement Checkboxes
                SetCheckbox(form, "Assessment", model.IsForAssessmentOnly);
                SetCheckbox(form, "Endorsed", model.IsEndorsedForPayment);

                // 4. Notes & Due Date
                SetField(form, "Today", model.PaymentDueDate ?? model.Date);

                // 5. Official Receipt (OR) Stamp Box
                if (!string.IsNullOrWhiteSpace(model.OrNo))
                {
                    SetField(form, "ORNumber", model.OrNo);
                    SetField(form, "ORAmount", model.OrAmount);
                    SetField(form, "ORDate", model.OrDate);
                    SetField(form, "ORBy", model.OrBy);
                }

                // 6. Signatures and Remarks
                SetField(form, "PreparedBy", model.PreparedByName ?? "EVALUATOR, NTC XIV");
                SetField(form, "PreparedByPosition", model.PreparedByTitle ?? "Evaluator");
                SetField(form, "ApprovedBy", model.ApprovedByName ?? "CEOD, NTC XIV");
                SetField(form, "ApprovedByPosition", model.ApprovedByTitle ?? "Chief Engineer");

                if (!string.IsNullOrWhiteSpace(model.Remarks))
                {
                    SetField(form, "Remarks", model.Remarks);
                }

                // 7. Line Items in Fee Matrix
                FillLineItems(form, model);

                // Flatten all form fields to bake text permanently into the official template
                form.FlattenFields();
            }

            // 8. Render TOTAL amount in the designated Sub-Total column (y ≈ 321f, x ≈ 544f)
            if (model.TotalAmount.HasValue && model.TotalAmount.Value > 0)
            {
                var page = pdfDoc.GetFirstPage();
                var canvas = new PdfCanvas(page);
                using var layoutCanvas = new Canvas(canvas, page.GetPageSize());
                layoutCanvas.ShowTextAligned(
                    new Paragraph(model.TotalAmount.Value.ToString("N2"))
                        .SetFontSize(8.5f)
                        .SetBold(),
                    544f, 321.5f,
                    TextAlignment.RIGHT);
            }
        }

        return outStream.ToArray();
    }

    private static void FillLineItems(PdfAcroForm form, StatementOfAccountModel model)
    {
        foreach (var item in model.Items)
        {
            if (item.SubTotal == null && item.Particular1.Fees == null)
            {
                continue;
            }

            string feeStr = item.SubTotal.HasValue && item.SubTotal.Value > 0
                ? item.SubTotal.Value.ToString("N2")
                : (item.Particular1.Fees.HasValue && item.Particular1.Fees.Value > 0 ? item.Particular1.Fees.Value.ToString("N2") : string.Empty);

            var desc = item.Description.ToLowerInvariant();
            var code = item.Code.Trim();

            // Match by category and description
            if (item.Category == SoaCategory.Licenses)
            {
                if (desc.Contains("permit to purchase"))
                {
                    FillRow(form, 1, item.Particular1, "PermittoPurchase", feeStr);
                }
                else if (desc.Contains("filling") || desc.Contains("filing fee"))
                {
                    FillRow(form, 2, item.Particular1, "FilingFee", feeStr);
                }
                else if (desc.Contains("possess") || desc.Contains("storage"))
                {
                    FillRow(form, 3, item.Particular1, "PermittoPossessStorage", feeStr);
                }
                else if (desc.Contains("construction"))
                {
                    FillRow(form, 4, item.Particular1, "ConstructionPermitFee", feeStr);
                }
                else if (desc.Contains("radio station license"))
                {
                    FillRow(form, 5, item.Particular1, "RadioStationLicense", feeStr);
                }
                else if (desc.Contains("inspection"))
                {
                    FillRow(form, 6, item.Particular1, "InspectionFee", feeStr);
                }
                else if (desc.Contains("spectrum") || desc.Contains("suf"))
                {
                    FillRow(form, 7, item.Particular1, "SpectrumUsersFeeSUF", feeStr);
                }
                else if (desc.Contains("fine") || desc.Contains("penalty") || desc.Contains("surcharge"))
                {
                    FillRow(form, 9, item.Particular1, "FinesPenaltiesSurchargesSURRadioStationLicenseSURSpectrumUsersFeeSUF", feeStr);
                }
            }
            else if (item.Category == SoaCategory.Permits)
            {
                if (desc.Contains("permit fees") || desc.Contains("dealers"))
                {
                    FillRow(form, 10, item.Particular1, "PermitFeesDealersResellerServiceCenterSellTransferRECImport", feeStr);
                }
                else if (desc.Contains("inspection"))
                {
                    FillRow(form, 13, item.Particular1, "InspectionFee1", feeStr);
                }
                else if (desc.Contains("filling") || desc.Contains("filing"))
                {
                    FillRow(form, 14, item.Particular1, "FilingFee1", feeStr);
                }
                else if (desc.Contains("fine") || desc.Contains("penalty") || desc.Contains("surcharge"))
                {
                    FillRow(form, 15, item.Particular1, "FinesPenaltiesSurcharges", feeStr);
                }
            }
            else if (item.Category == SoaCategory.AmateurRoc)
            {
                if (desc.Contains("radio station license"))
                {
                    FillRow(form, 16, item.Particular1, "RadioOperatorsLicense", feeStr);
                }
                else if (desc.Contains("operator's cert") || desc.Contains("operator cert"))
                {
                    FillRow(form, 17, item.Particular1, "RadioOperatorsCert", feeStr);
                }
                else if (desc.Contains("application") || desc.Contains("filing fee"))
                {
                    FillRow(form, 18, item.Particular1, "ApplicationFeeFilingFee", feeStr);
                }
                else if (desc.Contains("seminar"))
                {
                    FillRow(form, 19, item.Particular1, "SeminarFee", feeStr);
                }
                else if (desc.Contains("fine") || desc.Contains("penalty") || desc.Contains("surcharge"))
                {
                    FillRow(form, 21, item.Particular1, "FinesPenaltiesSurchargesSURRadioStationLicense", feeStr);
                }
            }
            else // OtherApplication
            {
                if (desc.Contains("registration"))
                {
                    FillRow(form, 29, item.Particular1, "RegistrationFee", feeStr);
                }
                else if (desc.Contains("supervision"))
                {
                    FillRow(form, 22, item.Particular1, "SupervisionRegulationFee", feeStr);
                }
                else if (desc.Contains("verification") || desc.Contains("authentication"))
                {
                    FillRow(form, 23, item.Particular1, "VerificationFeeAuthenticationFees", feeStr);
                }
                else if (desc.Contains("examination"))
                {
                    FillRow(form, 24, item.Particular1, "ExaminationFee", feeStr);
                }
                else if (desc.Contains("clearance") || desc.Contains("certification"))
                {
                    FillRow(form, 25, item.Particular1, "ClearanceCertificationFee", feeStr);
                }
                else if (desc.Contains("modification"))
                {
                    FillRow(form, 26, item.Particular1, "ModificationFee", feeStr);
                }
                else if (desc.Contains("miscellaneous"))
                {
                    FillRow(form, 27, item.Particular1, "MiscellaneousIncome", feeStr);
                }
                else if (desc.Contains("stamp") || desc.Contains("dst"))
                {
                    FillRow(form, 28, item.Particular1, "DocumentaryStampTaxDST", feeStr);
                }
                else // Others
                {
                    FillRow(form, 30, item.Particular1, "OthersPENALTYFORLATEDELIVERY", feeStr);
                    if (!string.IsNullOrWhiteSpace(item.Description) && item.Description != "Others")
                    {
                        SetField(form, "OtherText", item.Description.Replace("Others:", "").Trim());
                    }
                }
            }
        }
    }

    private static void FillRow(PdfAcroForm form, int rowNum, StatementOfAccountFeeDetail detail, string totalField, string totalValue)
    {
        SetField(form, $"TableRow{rowNum}Col1", detail.NoOfYrs);
        SetField(form, $"TableRow{rowNum}Col2", detail.Percent);
        SetField(form, $"TableRow{rowNum}Col3", detail.NoOfUnits);
        SetField(form, $"TableRow{rowNum}Col4", detail.Fees.HasValue && detail.Fees.Value > 0 ? detail.Fees.Value.ToString("N2") : string.Empty);
        SetField(form, totalField, totalValue);
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

    private static void SetCheckbox(PdfAcroForm form, string fieldName, bool isChecked)
    {
        if (!isChecked) return;
        var field = form.GetField(fieldName);
        if (field != null)
        {
            field.SetValue("Yes");
        }
    }
}
