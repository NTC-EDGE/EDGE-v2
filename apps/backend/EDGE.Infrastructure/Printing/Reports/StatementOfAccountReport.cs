using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable Statement of Account document for National Telecommunications Commission.
/// Renders a 1-up portrait page on standard A4 paper matching NTC official form layout.
/// </summary>
public class StatementOfAccountReport : IDocument
{
    private readonly StatementOfAccountModel _model;

    public StatementOfAccountReport(StatementOfAccountModel? model = null)
    {
        _model = model ?? new StatementOfAccountModel();
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.MarginHorizontal(15);
            page.MarginTop(25);
            page.MarginBottom(12);
            page.DefaultTextStyle(x => x.FontSize(8).FontFamily(Fonts.Arial));


            page.Content().Column(col =>
            {
                // 1. Header Title
                col.Item().Element(ComposeHeader);

                // 2. Top Info & Transaction Types Checkboxes
                col.Item().PaddingTop(4).Element(ComposeTopInfo);

                // 3. Main Data Table Matrix
                col.Item().PaddingTop(6).Element(ComposeGridTable);

                // 4. Payment Due Date Note
                col.Item().PaddingTop(6).Element(ComposePaymentDueDateNote);

                // 5. Lower Section: O.R. Stamp Box, Assessment Checkboxes & Signatures
                col.Item().PaddingTop(8).Element(ComposeBottomSection);

                // 6. Remarks Section
                col.Item().PaddingTop(8).Element(ComposeRemarksSection);
            });
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().AlignCenter().Text(_model.AgencyName)
                .FontSize(10).Bold();

            col.Item().AlignCenter().Text(_model.Title)
                .FontSize(9.5f).Bold();
        });
    }

    private void ComposeTopInfo(IContainer container)
    {
        container.Row(row =>
        {
            // Left Column (~62% width)
            row.RelativeItem(0.62f).Column(col =>
            {
                col.Item().Text("To: The Accountant:").FontSize(8.5f);

                col.Item().PaddingTop(2).Row(r =>
                {
                    r.AutoItem().Text("Please issue Order of Payment in favor of ").FontSize(8f);
                    r.RelativeItem().BorderBottom(0.5f).BorderColor(Colors.Black).AlignCenter()
                        .Text(_model.PayorName ?? string.Empty).Bold().FontSize(8.5f);
                });

                col.Item().Text("for payment of the fees indicated below:").FontSize(8f);

                // Checkboxes Grid (3 rows x 4 columns)
                col.Item().PaddingTop(4).Table(chkTable =>
                {
                    chkTable.ColumnsDefinition(cd =>
                    {
                        cd.RelativeColumn(1f);
                        cd.RelativeColumn(1f);
                        cd.RelativeColumn(1.4f);
                        cd.RelativeColumn(1f);
                    });

                    // Row 1
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "NEW", _model.IsNew));
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "MOD", _model.IsMod));
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "CO", _model.IsCo));
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "MA", _model.IsMa));

                    // Row 2
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "REN", _model.IsRen));
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "DUP", _model.IsDup));
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "CV", _model.IsCv));
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "ROC", _model.IsRoc));

                    // Row 3
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "OTHERS RROCA", _model.IsOthersRroca));
                    chkTable.Cell().Element(e => RenderCheckboxItem(e, "MS", _model.IsMs));
                    chkTable.Cell().ColumnSpan(2).Element(e => RenderCheckboxItem(e, "Others: " + (_model.OthersText ?? ""), _model.IsOthers));
                });
            });

            row.ConstantItem(15); // Spacer

            // Right Column (~38% width)
            row.RelativeItem(0.38f).Column(col =>
            {
                col.Item().Row(r =>
                {
                    r.AutoItem().Text("No.:  ").Bold().FontSize(8.5f);
                    r.RelativeItem().BorderBottom(0.5f).BorderColor(Colors.Black).AlignCenter()
                        .Text(_model.AccountNo ?? string.Empty).Bold().FontSize(8.5f);
                });

                col.Item().Text(_model.Subtitle).FontSize(6.5f).Italic();

                col.Item().PaddingTop(4).Row(r =>
                {
                    r.AutoItem().Text("Date:  ").FontSize(8.5f);
                    r.RelativeItem().BorderBottom(0.5f).BorderColor(Colors.Black).AlignCenter()
                        .Text(_model.Date ?? string.Empty).FontSize(8.5f);
                });
            });
        });
    }

    private void RenderCheckboxItem(IContainer container, string label, bool isChecked)
    {
        container.PaddingVertical(1).Row(r =>
        {
            r.ConstantItem(10).Height(10).Border(0.8f).BorderColor(Colors.Black).AlignCenter().AlignMiddle().Element(box =>
            {
                if (isChecked)
                {
                    box.Text("✓").FontSize(6f).Bold();
                }
            });

            r.RelativeItem().PaddingLeft(3).Text(label).FontSize(7.5f);
        });
    }


    private void ComposeGridTable(IContainer container)
    {
        container.Border(1f).BorderColor(Colors.Black).Table(table =>
        {
            table.ColumnsDefinition(cd =>
            {
                cd.ConstantColumn(58);  // 0: Code
                cd.ConstantColumn(155); // 1: Description

                // Particular 1
                cd.ConstantColumn(22);  // 2: No. of Yrs.
                cd.ConstantColumn(16);  // 3: %
                cd.ConstantColumn(24);  // 4: No. of Units
                cd.ConstantColumn(38);  // 5: Fees

                // Particular 2
                cd.ConstantColumn(22);  // 6: No. of Yrs.
                cd.ConstantColumn(16);  // 7: %
                cd.ConstantColumn(24);  // 8: No. of Units
                cd.ConstantColumn(38);  // 9: Fees

                // Particular 3
                cd.ConstantColumn(22);  // 10: No. of Yrs.
                cd.ConstantColumn(16);  // 11: %
                cd.ConstantColumn(24);  // 12: No. of Units
                cd.ConstantColumn(38);  // 13: Fees

                // Sub-Total
                cd.RelativeColumn(1f);  // 14: SUB-TOTAL
            });

            // --- Header Row 1 ---
            table.Cell().RowSpan(3).Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
                .Text("Code").Bold().FontSize(7.5f);

            table.Cell().RowSpan(3).Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
                .Text("Description").Bold().FontSize(7.5f);

            // Particular 1 Header
            table.Cell().ColumnSpan(4).Border(0.5f).BorderColor(Colors.Black).Padding(1)
                .Text($"Particular : {_model.Particular1Header ?? string.Empty}").FontSize(7f);

            // Particular 2 Header
            table.Cell().ColumnSpan(4).Border(0.5f).BorderColor(Colors.Black).Padding(1)
                .Text($"Particular : {_model.Particular2Header ?? string.Empty}").FontSize(7f);

            // Particular 3 Header
            table.Cell().ColumnSpan(4).Border(0.5f).BorderColor(Colors.Black).Padding(1)
                .Text($"Particular : {_model.Particular3Header ?? string.Empty}").FontSize(7f);

            table.Cell().RowSpan(3).Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
                .Text("SUB-\nTOTAL").Bold().FontSize(7.5f);

            // --- Header Row 2: Period Covered ---
            table.Cell().ColumnSpan(4).Border(0.5f).BorderColor(Colors.Black).Padding(1)
                .Text($"Period Covered: {_model.Particular1PeriodCovered ?? string.Empty}").FontSize(6.5f);

            table.Cell().ColumnSpan(4).Border(0.5f).BorderColor(Colors.Black).Padding(1)
                .Text($"Period Covered: {_model.Particular2PeriodCovered ?? string.Empty}").FontSize(6.5f);

            table.Cell().ColumnSpan(4).Border(0.5f).BorderColor(Colors.Black).Padding(1)
                .Text($"Period Covered: {_model.Particular3PeriodCovered ?? string.Empty}").FontSize(6.5f);

            // --- Header Row 3: Sub-column headers ---
            for (int p = 0; p < 3; p++)
            {
                table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle().Text("No. of Yrs.").FontSize(5.5f);
                table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle().Text("%").FontSize(5.5f);
                table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle().Text("No. of Units").FontSize(5.5f);
                table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle().Text("Fees").FontSize(5.5f);
            }

            // --- Data Rows grouped by Category ---
            RenderCategorySection(table, SoaCategory.Licenses, "FOR LICENSES");
            RenderCategorySection(table, SoaCategory.Permits, "FOR PERMITS");
            RenderCategorySection(table, SoaCategory.AmateurRoc, "FOR AMATUER AND ROC");
            RenderCategorySection(table, SoaCategory.OtherApplication, "OTHER APPLICATION");

            // --- TOTAL Row ---
            table.Cell().ColumnSpan(14).Border(0.5f).BorderColor(Colors.Black).AlignRight().PaddingRight(6)
                .Text("TOTAL").Bold().FontSize(8f);

            string totalStr = _model.TotalAmount.HasValue ? $"P{_model.TotalAmount.Value:N2}" : string.Empty;
            table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignRight().PaddingRight(2).AlignMiddle()
                .Text(totalStr).Bold().FontSize(8f);
        });
    }

    private void RenderCategorySection(TableDescriptor table, SoaCategory category, string categoryTitle)
    {
        // Category Banner Header
        table.Cell().ColumnSpan(15).Border(0.5f).BorderColor(Colors.Black).AlignCenter().PaddingVertical(1)
            .Text(categoryTitle).Bold().FontSize(7.5f);

        var items = _model.Items.FindAll(i => i.Category == category);
        foreach (var item in items)
        {
            // Code
            table.Cell().Border(0.5f).BorderColor(Colors.Black).PaddingHorizontal(2).AlignMiddle()
                .Text(item.Code).FontSize(6.8f);

            // Description
            table.Cell().Border(0.5f).BorderColor(Colors.Black).PaddingHorizontal(2).AlignMiddle()
                .Text(item.Description).FontSize(6.8f);

            // Particular 1
            RenderFeeDetailCells(table, item.Particular1);

            // Particular 2
            RenderFeeDetailCells(table, item.Particular2);

            // Particular 3
            RenderFeeDetailCells(table, item.Particular3);

            // SubTotal
            string subTotalStr = item.SubTotal.HasValue ? item.SubTotal.Value.ToString("N2") : string.Empty;
            table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignRight().PaddingRight(2).AlignMiddle()
                .Text(subTotalStr).FontSize(6.8f);
        }
    }

    private static void RenderFeeDetailCells(TableDescriptor table, StatementOfAccountFeeDetail detail)
    {
        table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
            .Text(detail.NoOfYrs ?? string.Empty).FontSize(6.5f);

        table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
            .Text(detail.Percent ?? string.Empty).FontSize(6.5f);

        table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
            .Text(detail.NoOfUnits ?? string.Empty).FontSize(6.5f);

        string feeStr = detail.Fees.HasValue ? detail.Fees.Value.ToString("N2") : string.Empty;
        table.Cell().Border(0.5f).BorderColor(Colors.Black).AlignRight().PaddingRight(2).AlignMiddle()
            .Text(feeStr).FontSize(6.5f);
    }

    private void ComposePaymentDueDateNote(IContainer container)
    {
        container.Row(row =>
        {
            row.AutoItem().Text("Note: To be paid on or before  ").Bold().FontSize(8f);

            row.ConstantItem(120).BorderBottom(0.5f).BorderColor(Colors.Black).AlignCenter()
                .Text(_model.PaymentDueDate ?? string.Empty).FontSize(8f);

            row.AutoItem().Text("  otherwise subject to reassessment.").Bold().FontSize(8f);
        });
    }

    private void ComposeBottomSection(IContainer container)
    {
        container.Row(row =>
        {
            // 1. Bottom-Left O.R. Stamp Box (Width ~140pt)
            row.ConstantItem(140).Border(1f).BorderColor(Colors.Black).Padding(3).Column(orCol =>
            {
                orCol.Item().Row(r =>
                {
                    r.ConstantItem(32).AlignMiddle().Text("O.R.").Bold().FontSize(9.5f);
                    r.RelativeItem().Column(details =>
                    {
                        details.Item().Row(dr =>
                        {
                            dr.ConstantItem(40).Text("No.").FontSize(7.5f);
                            dr.RelativeItem().Text(_model.OrNo ?? string.Empty).FontSize(7.5f);
                        });
                        details.Item().Row(dr =>
                        {
                            dr.ConstantItem(40).Text("AMOUNT:").FontSize(7f);
                            dr.RelativeItem().Text(_model.OrAmount ?? string.Empty).Bold().FontSize(8f);
                        });
                        details.Item().Row(dr =>
                        {
                            dr.ConstantItem(40).Text("Date:").FontSize(7.5f);
                            dr.RelativeItem().Text(_model.OrDate ?? string.Empty).FontSize(7.5f);
                        });
                        details.Item().Row(dr =>
                        {
                            dr.ConstantItem(40).Text("By:").FontSize(7.5f);
                            dr.RelativeItem().Text(_model.OrBy ?? string.Empty).FontSize(7.5f);
                        });
                    });
                });
            });

            row.ConstantItem(15); // Spacer

            // 2. Center Assessment Checkboxes (~140pt)
            row.ConstantItem(140).Column(chkCol =>
            {
                chkCol.Item().PaddingTop(8).Element(e => RenderCheckboxItem(e, "For assessment only", _model.IsForAssessmentOnly));
                chkCol.Item().PaddingTop(8).Element(e => RenderCheckboxItem(e, "Endorsed for Payment", _model.IsEndorsedForPayment));
            });

            row.RelativeItem(); // Spacer

            // 3. Right Signatures Block (Prepared By & Approved By) (~220pt)
            row.ConstantItem(220).Column(sigCol =>
            {
                sigCol.Item().Row(sigRow =>
                {
                    // Prepared By
                    sigRow.RelativeItem().Column(pCol =>
                    {
                        pCol.Item().Text("PREPARED BY:").Bold().FontSize(7.5f);
                        pCol.Item().Height(20).AlignCenter().AlignBottom().Text(_model.PreparedByName ?? string.Empty).Bold().FontSize(8f);
                        pCol.Item().LineHorizontal(0.5f).LineColor(Colors.Black);
                        pCol.Item().AlignCenter().Text(_model.PreparedByTitle).FontSize(7.5f);
                    });

                    sigRow.ConstantItem(10); // Spacer

                    // Approved By
                    sigRow.RelativeItem().Column(aCol =>
                    {
                        aCol.Item().Text("APPROVED BY:").Bold().FontSize(7.5f);
                        aCol.Item().Height(20).AlignCenter().AlignBottom().Text(_model.ApprovedByName ?? string.Empty).Bold().FontSize(8f);
                        aCol.Item().LineHorizontal(0.5f).LineColor(Colors.Black);
                        aCol.Item().AlignCenter().Text(_model.ApprovedByTitle).FontSize(7.5f);
                    });
                });
            });
        });
    }

    private void ComposeRemarksSection(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text("REMARK/S").Bold().FontSize(8f).Underline();
            col.Item().PaddingTop(2).Text(_model.Remarks).FontSize(7.5f);
        });
    }
}
